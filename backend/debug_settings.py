import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings_test')
django.setup()

from accounts.models import GlobalConfiguration
from accounts.views import GlobalConfigurationViewSet
from rest_framework.test import APIRequestFactory, force_authenticate
from accounts.models import CustomUser

def test_settings():
    factory = APIRequestFactory()
    view = GlobalConfigurationViewSet.as_view({'get': 'settings'})
    
    # Create a user for authentication
    user = CustomUser.objects.create_user(username='testuser', email='test@example.com', password='password', phone_number='+911234567890')
    
    request = factory.get('/api/config/settings/')
    force_authenticate(request, user=user)
    
    try:
        response = view(request)
        print(f"Status Code: {response.status_code}")
        print(f"Response Data: {response.data}")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_settings()
