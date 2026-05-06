from rest_framework import serializers
from .models import CalendarEvent
from accounts.serializers import UserBriefSerializer
from core.serializers import ClientField


class CalendarEventSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    assigned_to_details = UserBriefSerializer(source='assigned_to', many=True, read_only=True)
    case_title = serializers.CharField(source='case.case_title', read_only=True)
    case_number = serializers.CharField(source='case.case_number', read_only=True)
    client = ClientField(required=False, allow_null=True)
    client_name = serializers.CharField(source='client.get_full_name', read_only=True)
    firm_name = serializers.CharField(source='firm.firm_name', read_only=True)
    is_upcoming = serializers.BooleanField(read_only=True)
    is_past = serializers.BooleanField(read_only=True)
    is_today = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = CalendarEvent
        fields = [
            'id', 'title', 'description', 'event_type', 'priority', 'status',
            'start_datetime', 'end_datetime', 'all_day', 'location', 'court_name',
            'firm', 'firm_name', 'case', 'case_title', 'case_number', 'client', 'client_name',
            'created_by', 'created_by_name', 'assigned_to', 'assigned_to_details',
            'reminder_sent', 'reminder_time', 'notes',
            'is_upcoming', 'is_past', 'is_today',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class PlatformOwnerEventSerializer(serializers.ModelSerializer):
    """Serializer for platform owner — firm is writable"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    firm_name = serializers.CharField(source='firm.firm_name', read_only=True)
    client = ClientField(required=False, allow_null=True)
    client_name = serializers.CharField(source='client.get_full_name', read_only=True)
    is_upcoming = serializers.BooleanField(read_only=True)
    is_past = serializers.BooleanField(read_only=True)
    is_today = serializers.BooleanField(read_only=True)

    class Meta:
        model = CalendarEvent
        fields = [
            'id', 'title', 'description', 'event_type', 'priority', 'status',
            'start_datetime', 'end_datetime', 'all_day', 'location', 'court_name',
            'firm', 'firm_name', 'case', 'client', 'client_name',
            'created_by', 'created_by_name', 'assigned_to',
            'reminder_sent', 'reminder_time', 'notes',
            'is_upcoming', 'is_past', 'is_today',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class CalendarEventListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for calendar list view"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    case_title = serializers.CharField(source='case.case_title', read_only=True)
    assigned_count = serializers.SerializerMethodField()
    
    class Meta:
        model = CalendarEvent
        fields = [
            'id', 'title', 'event_type', 'priority', 'status',
            'start_datetime', 'end_datetime', 'all_day', 'location',
            'case_title', 'created_by_name', 'assigned_count'
        ]
    
    def get_assigned_count(self, obj):
        return obj.assigned_to.count()
