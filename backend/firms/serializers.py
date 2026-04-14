from rest_framework import serializers
from .models import Firm, Branch
from accounts.serializers import UserBriefSerializer


class BranchSerializer(serializers.ModelSerializer):
    admin_details = serializers.SerializerMethodField()

    class Meta:
        model = Branch
        fields = [
            'id', 'firm', 'branch_name', 'branch_code', 'city', 'state',
            'address', 'phone_number', 'email', 'is_active', 'admin_details',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_admin_details(self, obj):
        from accounts.models import CustomUser
        admin = CustomUser.objects.filter(
            firm_memberships__branch=obj, 
            firm_memberships__user_type='admin'
        ).first()
        if admin:
            return UserBriefSerializer(admin).data
        return None


class FirmSerializer(serializers.ModelSerializer):
    branches = BranchSerializer(many=True, read_only=True)
    super_admin_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Firm
        fields = [
            'id', 'firm_name', 'firm_code', 'city', 'state', 'country',
            'address', 'postal_code', 'registration_number', 'logo', 'practice_areas',
            'phone_number', 'email', 'website', 'subscription_type', 'is_active',
            'branches', 'super_admin_details', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_super_admin_details(self, obj):
        from accounts.models import CustomUser
        super_admin = CustomUser.objects.filter(
            firm=obj, 
            user_type='super_admin'
        ).first()
        if super_admin:
            return UserBriefSerializer(super_admin).data
        return None
