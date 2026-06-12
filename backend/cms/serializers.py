from rest_framework import serializers

from .models import FAQ, GalleryImage, HeroSlide, NewsPost, SiteSetting, TeamMember, Testimonial


# ── Hero Slides ──────────────────────────────

class HeroSlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroSlide
        fields = ['id', 'subtitle', 'title', 'background_image', 'cta_text', 'cta_link', 'order', 'is_active']


# ── News ─────────────────────────────────────

class NewsPostListSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True, default=None)

    class Meta:
        model = NewsPost
        fields = ['id', 'title', 'slug', 'category', 'excerpt', 'image', 'author_name', 'published_at']


class NewsPostDetailSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True, default=None)

    class Meta:
        model = NewsPost
        fields = [
            'id', 'title', 'slug', 'category', 'content', 'excerpt',
            'image', 'author', 'author_name', 'is_published', 'published_at',
            'created_at', 'updated_at',
        ]


class NewsPostAdminSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True, default=None)

    class Meta:
        model = NewsPost
        fields = '__all__'


# ── FAQ ──────────────────────────────────────

class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'answer', 'order', 'is_active']


# ── Testimonials ─────────────────────────────

class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = ['id', 'guest_name', 'guest_role', 'content', 'avatar', 'rating', 'is_active']


# ── Team ─────────────────────────────────────

class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = ['id', 'name', 'role', 'image', 'bio', 'social_links', 'order']


# ── Gallery ──────────────────────────────────

class GalleryImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryImage
        fields = [
            'id', 'image', 'category', 'title', 'description', 'alt_text',
            'is_published', 'caption', 'order', 'created_at', 'updated_at'
        ]


# ── Site Settings ────────────────────────────

class SiteSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSetting
        fields = ['id', 'key', 'value']
