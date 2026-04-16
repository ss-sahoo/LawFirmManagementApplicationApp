"""
Quick test script to verify document API functionality
Run with: python manage.py test documents.test_document_api
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from firms.models import Firm
from clients.models import Client
from cases.models import Case
from documents.models import UserDocument
from django.core.files.uploadedfile import SimpleUploadedFile

User = get_user_model()


class DocumentAPITestCase(TestCase):
    def setUp(self):
        """Set up test data"""
        # Create firm
        self.firm = Firm.objects.create(
            firm_name="Test Law Firm",
            firm_code="TEST001",
            email="test@lawfirm.com",
            phone_number="1234567890",
            city="Test City",
            state="Test State"
        )
        
        # Create super admin
        self.super_admin = User.objects.create_user(
            username="admin",
            email="admin@test.com",
            password="testpass123",
            first_name="Admin",
            last_name="User",
            user_type="super_admin",
            phone_number="+1234567890",
            firm=self.firm
        )
        
        # Create advocate
        self.advocate = User.objects.create_user(
            username="advocate",
            email="advocate@test.com",
            password="testpass123",
            first_name="Advocate",
            last_name="User",
            user_type="advocate",
            phone_number="+9876543210",
            firm=self.firm
        )
        
        # Create client
        self.client_obj = Client.objects.create(
            firm=self.firm,
            first_name="Test",
            last_name="Client",
            email="client@test.com",
            phone_number="9876543210",
            assigned_advocate=self.advocate
        )
        
        # Create case
        self.case = Case.objects.create(
            firm=self.firm,
            client=self.client_obj,
            assigned_advocate=self.advocate,
            case_title="Test Case",
            case_type="Civil",
            status="open"
        )
        
        self.client = APIClient()
    
    def test_upload_document_as_admin(self):
        """Test document upload by super admin"""
        self.client.force_authenticate(user=self.super_admin)
        
        # Create a test file
        test_file = SimpleUploadedFile(
            "test_document.pdf",
            b"file_content",
            content_type="application/pdf"
        )
        
        data = {
            'document_title': 'Test Agreement',
            'document_type': 'agreement',
            'document_file': test_file,
            'client': str(self.client_obj.id),
            'case': str(self.case.id),
            'description': 'Test document upload'
        }
        
        response = self.client.post('/api/documents/documents/', data, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['document_title'], 'Test Agreement')
        self.assertEqual(response.data['uploaded_by'], str(self.super_admin.id))
        self.assertFalse(response.data['is_deleted'])
    
    def test_soft_delete_document(self):
        """Test soft delete functionality"""
        self.client.force_authenticate(user=self.super_admin)
        
        # Create document
        doc = UserDocument.objects.create(
            uploaded_by=self.super_admin,
            firm=self.firm,
            client=self.client_obj,
            document_type='agreement',
            document_title='Test Doc',
            document_file='test.pdf'
        )
        
        # Soft delete
        response = self.client.delete(f'/api/documents/documents/{doc.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify document is soft deleted
        doc.refresh_from_db()
        self.assertTrue(doc.is_deleted)
        self.assertIsNotNone(doc.deleted_at)
        self.assertEqual(doc.deleted_by, self.super_admin)
    
    def test_restore_document(self):
        """Test restore functionality"""
        self.client.force_authenticate(user=self.super_admin)
        
        # Create and soft delete document
        doc = UserDocument.objects.create(
            uploaded_by=self.super_admin,
            firm=self.firm,
            document_type='agreement',
            document_title='Test Doc',
            document_file='test.pdf'
        )
        doc.soft_delete(self.super_admin)
        
        # Restore
        response = self.client.post(f'/api/documents/documents/{doc.id}/restore/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify document is restored
        doc.refresh_from_db()
        self.assertFalse(doc.is_deleted)
        self.assertIsNone(doc.deleted_at)
    
    def test_advocate_can_see_assigned_client_documents(self):
        """Test advocate can see documents for their assigned clients"""
        self.client.force_authenticate(user=self.advocate)
        
        # Create document for assigned client
        doc = UserDocument.objects.create(
            uploaded_by=self.super_admin,
            firm=self.firm,
            client=self.client_obj,
            document_type='agreement',
            document_title='Client Doc',
            document_file='test.pdf'
        )
        
        response = self.client.get('/api/documents/documents/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], str(doc.id))
    
    def test_get_documents_by_client(self):
        """Test filtering documents by client"""
        self.client.force_authenticate(user=self.super_admin)
        
        # Create documents
        UserDocument.objects.create(
            uploaded_by=self.super_admin,
            firm=self.firm,
            client=self.client_obj,
            document_type='agreement',
            document_title='Client Doc 1',
            document_file='test1.pdf'
        )
        
        response = self.client.get(
            f'/api/documents/documents/by_client/?client_id={self.client_obj.id}'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_get_documents_by_case(self):
        """Test filtering documents by case"""
        self.client.force_authenticate(user=self.super_admin)
        
        # Create document for case
        UserDocument.objects.create(
            uploaded_by=self.super_admin,
            firm=self.firm,
            case=self.case,
            document_type='petition',
            document_title='Case Doc',
            document_file='test.pdf'
        )
        
        response = self.client.get(
            f'/api/documents/documents/by_case/?case_id={self.case.id}'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_verify_document(self):
        """Test document verification by admin"""
        self.client.force_authenticate(user=self.super_admin)
        
        # Create document
        doc = UserDocument.objects.create(
            uploaded_by=self.advocate,
            firm=self.firm,
            document_type='agreement',
            document_title='Test Doc',
            document_file='test.pdf'
        )
        
        # Verify document
        response = self.client.patch(
            f'/api/documents/documents/{doc.id}/',
            {
                'verification_status': 'verified',
                'verification_notes': 'Approved'
            },
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check verification details
        doc.refresh_from_db()
        self.assertEqual(doc.verification_status, 'verified')
        self.assertEqual(doc.verified_by, self.super_admin)
        self.assertIsNotNone(doc.verified_at)


print("Document API tests created successfully!")
