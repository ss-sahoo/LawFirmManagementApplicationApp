"""
Test script for Advocate Client & Document Access endpoints

This script demonstrates how to test the new advocate endpoints.
Run with: python manage.py shell < test_advocate_endpoints.py
"""

from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import CustomUser
from firms.models import Firm
from clients.models import Client
from documents.models import UserDocument
from django.core.files.uploadedfile import SimpleUploadedFile


class AdvocateClientDocumentTest(TestCase):
    """Test advocate access to clients and documents"""
    
    def setUp(self):
        """Set up test data"""
        # Create a firm
        self.firm = Firm.objects.create(
            firm_name="Test Law Firm",
            firm_code="TEST001",
            email="firm@test.com",
            phone_number="+919876543210"
        )
        
        # Create an advocate
        self.advocate = CustomUser.objects.create_user(
            username="advocate@test.com",
            email="advocate@test.com",
            phone_number="+919876543211",
            password="testpass123",
            user_type="advocate",
            firm=self.firm,
            first_name="John",
            last_name="Advocate"
        )
        
        # Create another advocate
        self.other_advocate = CustomUser.objects.create_user(
            username="other@test.com",
            email="other@test.com",
            phone_number="+919876543212",
            password="testpass123",
            user_type="advocate",
            firm=self.firm,
            first_name="Jane",
            last_name="Other"
        )
        
        # Create a client assigned to first advocate
        self.client1 = Client.objects.create(
            firm=self.firm,
            first_name="Client",
            last_name="One",
            email="client1@test.com",
            phone_number="+919876543213",
            assigned_advocate=self.advocate,
            brief_summary="Test case 1"
        )
        
        # Create a client assigned to other advocate
        self.client2 = Client.objects.create(
            firm=self.firm,
            first_name="Client",
            last_name="Two",
            email="client2@test.com",
            phone_number="+919876543214",
            assigned_advocate=self.other_advocate,
            brief_summary="Test case 2"
        )
        
        # Create documents for client1
        self.doc1 = UserDocument.objects.create(
            uploaded_by=self.advocate,
            firm=self.firm,
            client=self.client1,
            document_type="aadhar",
            document_title="Aadhar Card",
            document_file=SimpleUploadedFile("aadhar.pdf", b"file_content")
        )
        
        self.doc2 = UserDocument.objects.create(
            uploaded_by=self.advocate,
            firm=self.firm,
            client=self.client1,
            document_type="pan",
            document_title="PAN Card",
            document_file=SimpleUploadedFile("pan.pdf", b"file_content")
        )
        
        # Create API client
        self.client_api = APIClient()
    
    def test_advocate_can_see_assigned_clients(self):
        """Test that advocate can see their assigned clients"""
        self.client_api.force_authenticate(user=self.advocate)
        response = self.client_api.get('/api/clients/my-clients/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], str(self.client1.id))
        self.assertEqual(response.data[0]['full_name'], "Client One")
    
    def test_advocate_cannot_see_other_clients(self):
        """Test that advocate cannot see clients assigned to others"""
        self.client_api.force_authenticate(user=self.advocate)
        response = self.client_api.get('/api/clients/my-clients/')
        
        # Should only see client1, not client2
        client_ids = [c['id'] for c in response.data]
        self.assertIn(str(self.client1.id), client_ids)
        self.assertNotIn(str(self.client2.id), client_ids)
    
    def test_advocate_can_see_client_documents(self):
        """Test that advocate can see documents for their assigned client"""
        self.client_api.force_authenticate(user=self.advocate)
        response = self.client_api.get(f'/api/clients/{self.client1.id}/documents/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('client', response.data)
        self.assertIn('documents', response.data)
        self.assertIn('total_documents', response.data)
        self.assertEqual(response.data['total_documents'], 2)
        self.assertEqual(len(response.data['documents']), 2)
    
    def test_advocate_cannot_see_other_advocate_client_documents(self):
        """Test that advocate cannot see documents for clients not assigned to them"""
        self.client_api.force_authenticate(user=self.advocate)
        response = self.client_api.get(f'/api/clients/{self.client2.id}/documents/')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)
    
    def test_non_advocate_cannot_access_endpoints(self):
        """Test that non-advocates cannot access advocate endpoints"""
        # Create an admin user
        admin = CustomUser.objects.create_user(
            username="admin@test.com",
            email="admin@test.com",
            phone_number="+919876543215",
            password="testpass123",
            user_type="admin",
            firm=self.firm
        )
        
        self.client_api.force_authenticate(user=admin)
        
        # Try to access my-clients
        response = self.client_api.get('/api/clients/my-clients/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Try to access client documents
        response = self.client_api.get(f'/api/clients/{self.client1.id}/documents/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_unauthenticated_access_denied(self):
        """Test that unauthenticated users cannot access endpoints"""
        response = self.client_api.get('/api/clients/my-clients/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# Manual test instructions
print("""
=================================================================
ADVOCATE ENDPOINTS - MANUAL TEST INSTRUCTIONS
=================================================================

1. CREATE TEST DATA:
   - Create a firm
   - Create an advocate user
   - Create 2-3 clients assigned to that advocate
   - Upload some documents for those clients

2. TEST ENDPOINT 1: Get My Clients
   
   curl -X GET "http://localhost:8000/api/clients/my-clients/" \\
     -H "Authorization: Token YOUR_ADVOCATE_TOKEN"
   
   Expected: List of clients assigned to you

3. TEST ENDPOINT 2: Get Client Documents
   
   curl -X GET "http://localhost:8000/api/clients/{CLIENT_ID}/documents/" \\
     -H "Authorization: Token YOUR_ADVOCATE_TOKEN"
   
   Expected: Client details + array of documents

4. TEST SECURITY: Try accessing another advocate's client
   
   curl -X GET "http://localhost:8000/api/clients/{OTHER_CLIENT_ID}/documents/" \\
     -H "Authorization: Token YOUR_ADVOCATE_TOKEN"
   
   Expected: 404 Not Found

5. TEST SECURITY: Try accessing as non-advocate
   
   curl -X GET "http://localhost:8000/api/clients/my-clients/" \\
     -H "Authorization: Token ADMIN_TOKEN"
   
   Expected: 403 Forbidden

=================================================================
RUN AUTOMATED TESTS:
=================================================================

python manage.py test backend.test_advocate_endpoints

=================================================================
""")
