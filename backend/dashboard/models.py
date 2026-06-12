from django.conf import settings
from django.db import models


class NightAuditLog(models.Model):
    audit_date = models.DateField(unique=True)
    total_rooms_sold = models.PositiveIntegerField(default=0)
    total_rooms_available = models.PositiveIntegerField(default=0)
    occupancy_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    room_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    fnb_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    other_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    no_show_count = models.PositiveIntegerField(default=0)
    new_bookings = models.PositiveIntegerField(default=0)
    check_ins = models.PositiveIntegerField(default=0)
    check_outs = models.PositiveIntegerField(default=0)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='night_audits'
    )
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-audit_date']

    def __str__(self):
        return f"Night Audit — {self.audit_date}"
