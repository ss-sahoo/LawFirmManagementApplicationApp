from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import Client
from .serializers import ClientSerializer, AdvocateListSerializer
from accounts.models import CustomUser


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['first_name', 'last_name', 'email', 'phone_number']
    ordering_fields = ['created_at', 'last_name']

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'platform_owner':
            return Client.objects.all()
        
        # If user is a client, show only their own profile
        if user.user_type == 'client':
            return Client.objects.filter(user_account=user)
        
        return Client.objects.filter(firm=user.firm)

    def perform_create(self, serializer):
        user = self.request.user
        
        # Only admin/super_admin/advocate can register clients
        if user.user_type not in ['admin', 'super_admin', 'advocate', 'platform_owner']:
            raise PermissionDenied("Only Admins or Advocates can register clients.")
        
        # When admin/super_admin adds a client, assigned_advocate is REQUIRED
        if user.user_type in ['admin', 'super_admin']:
            advocate_id = self.request.data.get('assigned_advocate')
            if not advocate_id:
                raise PermissionDenied("You must assign an advocate when registering a client.")
            
            # Validate the advocate belongs to the same firm
            try:
                advocate = CustomUser.objects.get(id=advocate_id, user_type='advocate', firm=user.firm)
            except CustomUser.DoesNotExist:
                raise PermissionDenied("Invalid advocate. The advocate must belong to your firm.")
        
        # When advocate adds a client, auto-assign themselves
        if user.user_type == 'advocate':
            serializer.save(firm=user.firm, assigned_advocate=user)
            return
        
        serializer.save(firm=user.firm)

    @action(detail=False, methods=['get'], url_path='advocates', url_name='advocate-list')
    def list_advocates(self, request):
        """
        List all advocates in the user's firm.
        - Used by Admins when registering a client (dropdown).
        - Used by self-registered Clients to browse and choose an advocate.
        """
        user = request.user
        firm = user.firm
        
        if not firm:
            return Response(
                {'error': 'You are not associated with any firm.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        advocates = CustomUser.objects.filter(firm=firm, user_type='advocate', is_active=True)
        serializer = AdvocateListSerializer(advocates, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='choose-advocate', url_name='choose-advocate')
    def choose_advocate(self, request):
        """
        For self-registered clients: choose an advocate from the firm.
        The client must have signed up and logged in first.
        """
        user = request.user
        
        if user.user_type != 'client':
            return Response(
                {'error': 'Only clients can choose an advocate.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        advocate_id = request.data.get('advocate_id')
        if not advocate_id:
            return Response(
                {'error': 'advocate_id is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate advocate
        try:
            advocate = CustomUser.objects.get(id=advocate_id, user_type='advocate', firm=user.firm)
        except CustomUser.DoesNotExist:
            return Response(
                {'error': 'Invalid advocate. The advocate must belong to your firm.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find or create client profile for this user
        client_profile, created = Client.objects.get_or_create(
            user_account=user,
            defaults={
                'firm': user.firm,
                'first_name': user.first_name or '',
                'last_name': user.last_name or '',
                'email': user.email,
                'phone_number': user.phone_number or '',
                'assigned_advocate': advocate
            }
        )
        
        if not created:
            client_profile.assigned_advocate = advocate
            client_profile.save()
        
        return Response({
            'message': f'You are now assigned to Adv. {advocate.get_full_name()}',
            'client': ClientSerializer(client_profile).data
        })
