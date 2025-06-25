from django.urls import path

from .views import ParserFetchAPIView, ProductListAPIView

urlpatterns = [
    path('parser-search-product/', ParserFetchAPIView.as_view(), name='parser-search-product'),
    path('products/', ProductListAPIView.as_view(), name='product-list'),
]