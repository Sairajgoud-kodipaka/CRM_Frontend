'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingCart, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Package,
  BarChart3,
  Settings,
  ExternalLink,
  RefreshCw,
  Eye,
  Target,
  Calendar,
  CheckCircle
} from 'lucide-react';
import api from '@/lib/api';

interface EcommerceMetrics {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  conversionRate: number;
  revenueGrowth: number;
  orderGrowth: number;
  customerGrowth: number;
}

interface Platform {
  id: string;
  name: string;
  type: 'dukaan' | 'quicksell' | 'custom';
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  syncStatus: 'syncing' | 'synced' | 'failed';
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sales: number;
  revenue: number;
  platform: string;
  status: 'active' | 'inactive' | 'out_of_stock';
}

interface Order {
  id: string;
  customerName: string;
  platform: string;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  items: number;
}

export default function EcommerceDashboard() {
  const [metrics, setMetrics] = useState<EcommerceMetrics>({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
    customerGrowth: 0
  });
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEcommerceData();
  }, []);

  const fetchEcommerceData = async () => {
    setLoading(true);
    try {
      const summaryResponse = await api.get('/marketing/ecommerce-summary/');
      const platformsResponse = await api.get('/marketing/platforms/');
      const productsResponse = await api.get('/products/list/');
      const summaryData = summaryResponse.data;

      setMetrics({
        totalSales: summaryData.total_sales,
        totalOrders: summaryData.total_orders,
        totalCustomers: summaryData.customers,
        averageOrderValue: summaryData.avg_order_value,
        conversionRate: summaryData.conversion_rate,
        revenueGrowth: summaryData.revenue_growth,
        orderGrowth: summaryData.order_growth,
        customerGrowth: summaryData.customer_growth
      });
      
      setPlatforms(platformsResponse.data.map((platform: any) => ({
        id: platform.id,
        name: platform.name,
        type: platform.platform_type,
        status: platform.status,
        lastSync: platform.last_sync,
        totalProducts: platform.total_products,
        totalOrders: platform.total_orders,
        totalRevenue: platform.total_revenue,
        syncStatus: 'synced'
      })));
      
      setProducts(productsResponse.data.results);
      setOrders(summaryData.recent_orders);
    } catch (error) {
      console.error('Error fetching ecommerce data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-red-100 text-red-800';
      case 'error': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProductStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">E-commerce Marketing</h1>
          <p className="text-gray-600">Manage your online stores and product catalogs</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync All
          </Button>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Platform Settings
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{((metrics?.totalSales || 0) / 100000).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">
              +{metrics?.revenueGrowth || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{metrics?.orderGrowth || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalCustomers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{metrics?.customerGrowth || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{metrics?.averageOrderValue?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.conversionRate || 0}% conversion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Summary</CardTitle>
              </CardHeader>
              <CardContent>
                              <div className="space-y-4">
                {(platforms || []).map((platform) => (
                    <div key={platform.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            platform.status === 'connected' ? 'bg-green-500' : 
                            platform.status === 'error' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <div>
                            <h3 className="font-medium">{platform.name}</h3>
                            <p className="text-sm text-gray-500 capitalize">{platform.type}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(platform.status)}>
                          {platform.status.charAt(0).toUpperCase() + platform.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Products</p>
                          <p className="font-medium">{platform.totalProducts}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Orders</p>
                          <p className="font-medium">{platform.totalOrders}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Revenue</p>
                          <p className="font-medium">₹{(platform.totalRevenue / 1000).toFixed(0)}K</p>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-gray-500">
                        Last synced: {new Date(platform.lastSync).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(orders || []).slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium text-sm">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{order.platform} • {order.items} items</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">₹{order.total?.toLocaleString() || '0'}</p>
                        <Badge className={getOrderStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connected Platforms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(platforms || []).map((platform) => (
                  <div key={platform.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{platform.name}</h3>
                          <p className="text-sm text-gray-500 capitalize">{platform.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(platform.status)}>
                          {platform.status.charAt(0).toUpperCase() + platform.status.slice(1)}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Store
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-2xl font-bold text-blue-600">{platform.totalProducts}</div>
                        <div className="text-sm text-gray-600">Products</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-2xl font-bold text-green-600">{platform.totalOrders}</div>
                        <div className="text-sm text-gray-600">Orders</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-2xl font-bold text-purple-600">₹{(platform.totalRevenue / 1000).toFixed(0)}K</div>
                        <div className="text-sm text-gray-600">Revenue</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="text-2xl font-bold text-orange-600">
                          {platform.syncStatus === 'syncing' ? (
                            <RefreshCw className="h-6 w-6 animate-spin mx-auto" />
                          ) : (
                            <CheckCircle className="h-6 w-6 mx-auto text-green-600" />
                          )}
                        </div>
                        <div className="text-sm text-gray-600">Sync Status</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-500">
                Last synced: {platform.lastSync ? new Date(platform.lastSync).toLocaleString() : 'Never'}
              </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Sync Now
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4 mr-1" />
                          Settings
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Catalog</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(products || []).map((product) => (
                  <div key={product.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-sm text-gray-500">{product.category} • {product.platform}</p>
                        </div>
                      </div>
                      <Badge className={getProductStatusColor(product.status)}>
                        {product.status.replace('_', ' ').charAt(0).toUpperCase() + product.status.replace('_', ' ').slice(1)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Price</p>
                        <p className="font-medium">₹{product.price?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Stock</p>
                        <p className="font-medium">{product.stock}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Sales</p>
                        <p className="font-medium">{product.sales}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Revenue</p>
                        <p className="font-medium">₹{(product.revenue / 1000).toFixed(0)}K</p>
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(orders || []).map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">Order #{order.id}</h3>
                        <p className="text-sm text-gray-500">{order.customerName} • {order.platform}</p>
                      </div>
                      <Badge className={getOrderStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-gray-500">Total</p>
                        <p className="font-medium">₹{order.total?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Items</p>
                        <p className="font-medium">{order.items}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Platform</p>
                        <p className="font-medium">{order.platform}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Date</p>
                        <p className="font-medium">{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Track
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 