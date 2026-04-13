from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token
from accounts.models import CustomUser
from firms.models import Firm
from clients.models import Client
from cases.models import Case


class CaseAPITest(TestCase):
    """Test Case Management APIs"""
    
    def setUp(self):
        self.client = APIClient()
        
        # Create firm
        self.firm = Firm.objects.create(
            firm_name="Law Excellence",
            firm_code="LE2024",
            city="Delhi",
            state="Delhi"
        )
        
        # Create Advocate
        self.advocate = CustomUser.objects.create_user(
            username="advocate@le.com",
            email="advocate@le.com",
            password="Password123",
            user_type="advocate",
            firm=self.firm,
            phone_number="+919999999991"
        )
        self.advocate_token = Token.objects.create(user=self.advocate)
        
        # Create Client user
        self.client_user = CustomUser.objects.create_user(
            username="client@example.com",
            email="client@example.com",
            password="Password123",
            user_type="client",
            firm=self.firm,
            phone_number="+919999999992"
        )
        self.client_token = Token.objects.create(user=self.client_user)
        
        # Create a Client record
        self.client_record = Client.objects.create(
            firm=self.firm,
            first_name="John",
            last_name="Doe",
            email="john@doe.com",
            phone_number="+910000000000"
        )
        
        # URL for cases
        self.cases_url = reverse('case-list')

    def test_advocate_can_create_case(self):
        """Test that an advocate can create a case"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.advocate_token.key}')
        
        data = {
            "case_title": "Test Court Case",
            "category": "court_case",
            "case_type": "Civil",
            "petitioner_name": "John Doe",
            "respondent_name": "Jane Doe",
            "court_name": "High Court",
            "client": str(self.client_record.id),
            "assigned_advocate": str(self.advocate.id)
        }
        
        response = self.client.post(self.cases_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['case_title'], "Test Court Case")
        self.assertEqual(response.data['category'], "court_case")

    def test_client_cannot_create_case(self):
        """Test that a client is restricted from creating a case"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.client_token.key}')
        
        data = {
            "case_title": "Client's Case",
            "case_type": "Civil",
            "category": "pre_litigation",
            "client": str(self.client_record.id)
        }
        
        response = self.client.post(self.cases_url, data, format='json')
        # Should be forbidden for clients
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['detail'], "Only Advocates or Admins can create cases.")

    def test_filter_pre_litigation_cases(self):
        """Test filtering cases by pre-litigation category"""
        # Create one pre-lit and one court case
        Case.objects.create(
            firm=self.firm, client=self.client_record,
            case_title="Pre Litigation Case", category="pre_litigation"
        )
        Case.objects.create(
            firm=self.firm, client=self.client_record,
            case_title="Court Case", category="court_case"
        )
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.advocate_token.key}')
        
        # Request pre-litigation only
        response = self.client.get(self.cases_url, {'category': 'pre_litigation'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Depending on pagination, check results
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['case_title'], "Pre Litigation Case")

    def test_filter_active_cases(self):
        """Test filtering for active cases (is_active=true)"""
        # 1. Active case
        Case.objects.create(
            firm=self.firm, client=self.client_record,
            case_title="Active Case", status="running"
        )
        # 2. Inactive (disposed) case
        Case.objects.create(
            firm=self.firm, client=self.client_record,
            case_title="Disposed Case", status="disposed"
        )
        
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.advocate_token.key}')
        
        # Request active only
        response = self.client.get(self.cases_url, {'is_active': 'true'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['case_title'], "Active Case")
