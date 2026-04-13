from rest_framework import serializers
from .models import SubscriptionPlan, FirmSubscription

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'

class FirmSubscriptionSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    firm_name = serializers.CharField(source='firm.firm_name', read_only=True)
    is_valid = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = FirmSubscription
        fields = [
            'id', 'firm', 'firm_name', 'plan', 'plan_name', 
            'status', 'start_date', 'end_date', 'is_trial', 
            'auto_renew', 'is_valid', 'external_subscription_id'
        ]
        read_only_fields = ['id', 'start_date', 'firm']
