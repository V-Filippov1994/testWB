import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, ResponsiveContainer, Legend,
} from 'recharts';


function App() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    minPrice: 0,
    minRating: 0,
    minReviews: 0,
  });
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const [parserQuery, setParserQuery] = useState('');
  const [parserResults, setParserResults] = useState([]);

  // Добавляем состояние для загрузки и статуса
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const getFilteredProducts = async (
    minPrice = 0,
    minRating = 0,
    minReviews = 0,
    sortField = null,
    sortDirection = 'asc'
  ) => {
    try {
      const params = {
        price_with_discount__gte: minPrice,
        rating__gte: minRating,
        feedbacks__gte: minReviews,
      };
      if (sortField) {
        params.ordering = sortDirection === 'asc' ? sortField : `-${sortField}`;
      }
      const response = await axios.get('http://0.0.0.0:8000/api/web/products/', { params });
      setProducts(response.data);
    } catch (error) {
      console.error("Ошибка при получении продуктов:", error);
    }
  };

  const searchParserWB = async () => {
    if (!parserQuery.trim()) return;

    setLoading(true);
    setStatusMessage('Идет запрос...');

    try {
      const response = await axios.get('http://0.0.0.0:8000/api/web/parser-search-product/', {
        params: { search: parserQuery }
      });
      setParserResults(response.data);
      setStatusMessage('Запрос окончен');
      window.location.reload();
    } catch (error) {
      console.error("Ошибка при поиске через парсер:", error);
      setStatusMessage('Ошибка при запросе');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { minPrice, minRating, minReviews } = filters;
    getFilteredProducts(minPrice, minRating, minReviews, sortField, sortDirection);
  }, [
    filters.minPrice,
    filters.minRating,
    filters.minReviews,
    sortField,
    sortDirection
  ]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const maxPrice = products.length > 0 ? Math.max(...products.map(item => item.price_with_discount)) : 10000;

  return (
    <div className="container">
      <Filters
        filters={filters}
        onChange={handleFilterChange}
        maxPrice={maxPrice}
        searchParserWB={searchParserWB}
        parserQuery={parserQuery}
        setParserQuery={setParserQuery}
      />
      <div style={{ margin: '10px 0', fontWeight: 'bold', textAlign: 'center' }}>
        {statusMessage}
      </div>
      <Table
        products={products}
        onSort={handleSort}
        sortField={sortField}
        sortDirection={sortDirection}
      />
      <PriceHistogram
          products={products}
          maxPrice={maxPrice}/>
      <DiscountRatingChart products={products} />
    </div>
  );
}

const Filters = ({ filters, onChange, maxPrice, searchParserWB, parserQuery, setParserQuery}) => (
  <div className="filters">
    <div className="parserWB">
      <input
        type="text"
        value={parserQuery}
        onChange={(e) => setParserQuery(e.target.value)}
        placeholder="Добавить продукты в бд"
      />
      <button onClick={searchParserWB}>Отправить</button>
    </div>
    <div className="product-filter">
      <div className="filter-group">
        <label>Цена со скидкой:</label>
        <input
          type="range"
          min={0}
          max={maxPrice}
          step={1}
          value={filters.minPrice}
          onChange={(e) => onChange('minPrice', parseFloat(e.target.value))}
        />
        <span>{filters.minPrice} ₽</span>
      </div>
      <div className="filter-group">
        <label>Минимальный рейтинг:</label>
        <input
          type="number"
          min={0}
          max={5}
          step={0.1}
          value={filters.minRating}
          onChange={(e) => onChange('minRating', Number(e.target.value) >= 0 ? Number(e.target.value) : 0)}
        />
      </div>
      <div className="filter-group">
        <label>Количество отзывов:</label>
        <input
          type="number"
          min={0}
          value={filters.minReviews}
          onChange={(e) => onChange('minReviews', Number(e.target.value) >= 0 ? Number(e.target.value) : 0)}
        />
      </div>
    </div>
  </div>
);

const Table = ({ products, onSort, sortField, sortDirection }) => {
  const renderArrow = (field) => {
    if (field !== sortField) return '';
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <table className="product-table">
      <thead>
        <tr>
          <th onClick={() => onSort('name')} style={{ cursor: 'pointer' }}>
            Название товара{renderArrow('name')}
          </th>
          <th onClick={() => onSort('price_with_discount')} style={{ cursor: 'pointer' }}>
            Цена со скидкой{renderArrow('price_with_discount')}
          </th>
          <th onClick={() => onSort('full_price')} style={{ cursor: 'pointer' }}>
            Цена{renderArrow('full_price')}
          </th>
          <th onClick={() => onSort('rating')} style={{ cursor: 'pointer' }}>
            Рейтинг{renderArrow('rating')}
          </th>
          <th onClick={() => onSort('feedbacks')} style={{ cursor: 'pointer' }}>
            Отзывы{renderArrow('feedbacks')}
          </th>
        </tr>
      </thead>
      <tbody>
        {products.map(product => (
          <tr key={product.name}>
            <td>{product.name}</td>
            <td>{product.price_with_discount} ₽</td>
            <td>{product.full_price} ₽</td>
            <td>{product.rating}</td>
            <td>{product.feedbacks}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const PriceHistogram = ({ products, maxPrice }) => {
  const step = Math.ceil(maxPrice / 7);
  const bins = Array.from({ length: 7 + 1 }, (_, i) => i * step);

  const binLabels = bins.map((b, i) =>
      i < bins.length - 1 ? `${bins[i]}–${bins[i + 1]} ₽` : null
  ).filter(Boolean);

  const histogramData = binLabels.map((label, idx) => {
    const min = bins[idx];
    const max = bins[idx + 1];
    const count = products.filter((p) => p.price_with_discount >= min && p.price_with_discount < max).length;
    return { range: label, count };
  });

  return (
    <div style={{ width: '90%', height: 300, margin: '0 auto' }}>
      <h3>Гистограмма цен</h3>
      <ResponsiveContainer>
        <BarChart data={histogramData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="darkred" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const DiscountRatingChart = ({ products }) => {
  const data = products.map((p) => ({
    discount: p.full_price - p.price_with_discount,
    rating: p.rating,
    name: p.name,
  }));

  return (
    <div style={{ width: '90%', height: 300, margin: '100px auto' }}>
      <h3>Скидка vs Рейтинг</h3>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="discount" name="Скидка" unit=" ₽" />
          <YAxis dataKey="rating" domain={[0, 5]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="rating" stroke="#82ca9d" dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default App;
