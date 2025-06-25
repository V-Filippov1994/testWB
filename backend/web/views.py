from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import status
from rest_framework.filters import OrderingFilter
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Product
from .serializers import ProductSerializer
from .utils import parse_products


class ParserFetchAPIView(APIView):
    def get(self, request):
        query = request.GET.get('search')
        if not query:
            return Response({'error': 'search query required'}, status=status.HTTP_400_BAD_REQUEST)

        parse_products_list = parse_products(query)
        products = []
        if len(parse_products_list) > 0:
            for parse_product in parse_products_list:
                products.append(
                    Product(
                        name=parse_product.get('name', 'N/N'),
                        price_with_discount=parse_product.get('price_with_discount'),
                        full_price=parse_product.get('full_price'),
                        rating=parse_product.get('rating'),
                        feedbacks=parse_product.get('feedbacks'),
                    )
                )
            Product.objects.bulk_create(products, ignore_conflicts=True)
            return Response({'results': 'OK'}, status=status.HTTP_201_CREATED)
        return Response({'results': 'False'}, status=status.HTTP_200_OK)


class ProductListAPIView(ListAPIView):
    serializer_class = ProductSerializer
    queryset = Product.objects.all()
    filter_backends = [OrderingFilter, DjangoFilterBackend]
    filterset_fields = {
        'price_with_discount': ['gte', 'lte'],
        'rating': ['gte', 'lte'],
        'feedbacks': ['gte', 'lte'],
    }
    ordering_fields = ['name', 'full_price', 'price_with_discount', 'rating', 'feedbacks']