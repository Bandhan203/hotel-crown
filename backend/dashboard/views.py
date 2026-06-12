from datetime import date, datetime

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdmin
from bookings.models import Booking
from bookings.serializers import BookingListSerializer
from .models import NightAuditLog
from .services import (
    get_admin_dashboard_stats,
    get_night_audit_preview,
    run_night_audit,
    get_occupancy_report,
    get_revenue_report,
    get_arrivals_departures_report,
    get_no_show_report,
    get_cancellation_report,
    get_guest_ledger_report,
)


class AdminDashboardView(APIView):
    """GET /api/admin/dashboard/ — aggregated stats."""
    permission_classes = [IsAdmin]

    def get(self, request):
        stats = get_admin_dashboard_stats()
        return Response(stats)


class GuestDashboardView(APIView):
    """GET /api/guest/dashboard/ — guest's own stats."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        bookings = Booking.objects.filter(guest=request.user).select_related('room_type', 'room')
        return Response({
            'total_bookings': bookings.count(),
            'active_bookings': bookings.filter(status__in=['PENDING', 'CONFIRMED', 'CHECKED_IN']).count(),
            'recent_bookings': BookingListSerializer(bookings[:5], many=True).data,
        })


# ──────────────────────────────────────────────
# Night Audit
# ──────────────────────────────────────────────

class NightAuditPreviewView(APIView):
    """GET /api/admin/night-audit/preview/?date=YYYY-MM-DD"""
    permission_classes = [IsAdmin]

    def get(self, request):
        date_str = request.query_params.get('date')
        audit_date = datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else date.today()
        data = get_night_audit_preview(audit_date)
        return Response(data)


class NightAuditRunView(APIView):
    """POST /api/admin/night-audit/run/  body: { "date": "YYYY-MM-DD", "notes": "" }"""
    permission_classes = [IsAdmin]

    def post(self, request):
        date_str = request.data.get('date')
        audit_date = datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else date.today()
        notes = request.data.get('notes', '')

        try:
            log = run_night_audit(audit_date, request.user)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        if notes:
            log.notes = notes
            log.save(update_fields=['notes'])

        return Response({
            'id': log.id,
            'audit_date': log.audit_date.isoformat(),
            'total_rooms_sold': log.total_rooms_sold,
            'total_rooms_available': log.total_rooms_available,
            'occupancy_rate': float(log.occupancy_rate),
            'room_revenue': float(log.room_revenue),
            'fnb_revenue': float(log.fnb_revenue),
            'other_revenue': float(log.other_revenue),
            'total_revenue': float(log.total_revenue),
            'no_show_count': log.no_show_count,
            'new_bookings': log.new_bookings,
            'check_ins': log.check_ins,
            'check_outs': log.check_outs,
            'notes': log.notes,
            'performed_by': log.performed_by.full_name if log.performed_by else None,
            'created_at': log.created_at.isoformat(),
        }, status=status.HTTP_201_CREATED)


class NightAuditListView(APIView):
    """GET /api/admin/night-audit/"""
    permission_classes = [IsAdmin]

    def get(self, request):
        logs = NightAuditLog.objects.select_related('performed_by').all()[:60]
        return Response([
            {
                'id': l.id,
                'audit_date': l.audit_date.isoformat(),
                'occupancy_rate': float(l.occupancy_rate),
                'total_revenue': float(l.total_revenue),
                'room_revenue': float(l.room_revenue),
                'fnb_revenue': float(l.fnb_revenue),
                'other_revenue': float(l.other_revenue),
                'no_show_count': l.no_show_count,
                'new_bookings': l.new_bookings,
                'check_ins': l.check_ins,
                'check_outs': l.check_outs,
                'total_rooms_sold': l.total_rooms_sold,
                'total_rooms_available': l.total_rooms_available,
                'performed_by': l.performed_by.full_name if l.performed_by else None,
                'notes': l.notes,
                'created_at': l.created_at.isoformat(),
            }
            for l in logs
        ])


class NightAuditDetailView(APIView):
    """GET /api/admin/night-audit/<date>/"""
    permission_classes = [IsAdmin]

    def get(self, request, audit_date):
        try:
            d = datetime.strptime(audit_date, '%Y-%m-%d').date()
        except (ValueError, TypeError):
            return Response({'detail': 'Invalid date format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            log = NightAuditLog.objects.select_related('performed_by').get(audit_date=d)
        except NightAuditLog.DoesNotExist:
            return Response({'detail': 'No audit found for this date.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'id': log.id,
            'audit_date': log.audit_date.isoformat(),
            'total_rooms_sold': log.total_rooms_sold,
            'total_rooms_available': log.total_rooms_available,
            'occupancy_rate': float(log.occupancy_rate),
            'room_revenue': float(log.room_revenue),
            'fnb_revenue': float(log.fnb_revenue),
            'other_revenue': float(log.other_revenue),
            'total_revenue': float(log.total_revenue),
            'no_show_count': log.no_show_count,
            'new_bookings': log.new_bookings,
            'check_ins': log.check_ins,
            'check_outs': log.check_outs,
            'performed_by': log.performed_by.full_name if log.performed_by else None,
            'notes': log.notes,
            'created_at': log.created_at.isoformat(),
        })


# ──────────────────────────────────────────────
# Reports
# ──────────────────────────────────────────────

def _parse_date_range(request):
    """Parse start_date/end_date from query params, default to current month."""
    today = date.today()
    start_str = request.query_params.get('start_date')
    end_str = request.query_params.get('end_date')
    start = datetime.strptime(start_str, '%Y-%m-%d').date() if start_str else today.replace(day=1)
    end = datetime.strptime(end_str, '%Y-%m-%d').date() if end_str else today
    return start, end


class OccupancyReportView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        start, end = _parse_date_range(request)
        return Response(get_occupancy_report(start, end))


class RevenueReportView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        start, end = _parse_date_range(request)
        return Response(get_revenue_report(start, end))


class ArrivalsReportView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        date_str = request.query_params.get('date')
        report_date = datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else date.today()
        return Response(get_arrivals_departures_report(report_date))


class NoShowReportView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        start, end = _parse_date_range(request)
        return Response(get_no_show_report(start, end))


class CancellationReportView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        start, end = _parse_date_range(request)
        return Response(get_cancellation_report(start, end))


class GuestLedgerReportView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        return Response(get_guest_ledger_report())
