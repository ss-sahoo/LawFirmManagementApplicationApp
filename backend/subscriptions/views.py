from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import SubscriptionPlan, FirmSubscription
from .serializers import SubscriptionPlanSerializer, FirmSubscriptionSerializer
from .utils import get_subscription_status, can_add_user, can_add_client, can_add_case, can_add_branch

class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    """ViewSet for managing subscription plans (Platform Owner only)"""
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        # Only platform owner can create/update plans
        return [permissions.IsAuthenticated()] # Simplified for now, logic below

    def create(self, request, *args, **kwargs):
        if request.user.user_type != 'platform_owner':
            return Response({'error': 'Only Platform Owner can create plans'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

class FirmSubscriptionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing firm subscriptions"""
    serializer_class = FirmSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'platform_owner':
            return FirmSubscription.objects.all()
        # Firm members can only see their own firm's subscription
        return FirmSubscription.objects.filter(firm=user.firm)

    @action(detail=False, methods=['get'])
    def my_subscription(self, request):
        """Get the current firm's subscription details"""
        if not request.user.firm:
            return Response({'error': 'User is not associated with a firm'}, status=status.HTTP_400_BAD_REQUEST)
        
        subscription = FirmSubscription.objects.filter(firm=request.user.firm).first()
        if not subscription:
            return Response({'error': 'No subscription found for this firm'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(subscription)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def status(self, request):
        """Get comprehensive subscription status with usage and limits"""
        if not request.user.firm:
            return Response({'error': 'User is not associated with a firm'}, status=status.HTTP_400_BAD_REQUEST)
        
        status_data = get_subscription_status(request.user.firm)
        return Response(status_data)
    
    @action(detail=False, methods=['post'])
    def check_limit(self, request):
        """Check if firm can add a specific resource type"""
        if not request.user.firm:
            return Response({'error': 'User is not associated with a firm'}, status=status.HTTP_400_BAD_REQUEST)
        
        resource_type = request.data.get('resource_type')  # 'advocate', 'paralegal', 'admin', 'client', 'case', 'branch'
        user_type = request.data.get('user_type')  # for user resources
        
        firm = request.user.firm
        
        if resource_type == 'user' and user_type:
            can_add, message, upgrade_required = can_add_user(firm, user_type)
        elif resource_type == 'client':
            can_add, message, upgrade_required = can_add_client(firm)
        elif resource_type == 'case':
            can_add, message, upgrade_required = can_add_case(firm)
        elif resource_type == 'branch':
            can_add, message, upgrade_required = can_add_branch(firm)
        else:
            return Response({'error': 'Invalid resource_type'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'can_add': can_add,
            'message': message,
            'upgrade_required': upgrade_required
        })

    @action(detail=False, methods=['post'])
    def subscribe(self, request):
        """Placeholder for upgrade/subscribe logic"""
        # Logic to handle Stripe/Razorpay would go here
        return Response({'message': 'Payment gateway integration pending'})
