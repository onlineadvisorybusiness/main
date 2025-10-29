'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { 
  ArrowLeftRight, 
  Download, 
  Filter, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  FileText, 
  Search,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Receipt,
  Settings,
  MoreHorizontal,
  ArrowUpDown,
  ChevronDown,
  SortAsc,
  SortDesc,
  CalendarDays,
  Wallet,
  Building,
  Phone,
  Mail,
  MapPin,
  Plus,
  Edit3,
  Trash2,
  Star,
  Shield
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

// Real data fetching functions
const fetchTransactions = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams()
    
    if (filters.status && filters.status !== 'all') {
      queryParams.append('status', filters.status)
    }
    if (filters.category && filters.category !== 'all') {
      queryParams.append('category', filters.category)
    }
    if (filters.startDate) {
      queryParams.append('startDate', filters.startDate)
    }
    if (filters.endDate) {
      queryParams.append('endDate', filters.endDate)
    }
    if (filters.limit) {
      queryParams.append('limit', filters.limit)
    }
    if (filters.offset) {
      queryParams.append('offset', filters.offset)
    }

    const response = await fetch(`/api/transactions?${queryParams.toString()}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return {
      success: false,
      error: error.message,
      transactions: [],
      summary: {
        totalSpent: 0,
        totalEarned: 0,
        pendingAmount: 0,
        refundedAmount: 0,
        totalTransactions: 0
      }
    }
  }
}

export default function TransactionsPage({ params }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [sortBy, setSortBy] = useState('paymentDate')
  const [sortOrder, setSortOrder] = useState('desc')
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  
  // Real data state
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState({
    totalSpent: 0,
    totalEarned: 0,
    pendingAmount: 0,
    refundedAmount: 0,
    totalTransactions: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])

  // Skeleton components
  const SummaryCardSkeleton = () => (
    <Card className="border-0 shadow-sm bg-slate-50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )

  const TransactionRowSkeleton = () => (
    <TableRow className="hover:bg-slate-50 h-20 border-b">
      <TableCell className="px-4 py-4 text-center">
        <Skeleton className="h-4 w-8 mx-auto" />
      </TableCell>
      <TableCell className="px-4 py-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-16 rounded" />
          </div>
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
      </TableCell>
      <TableCell className="px-4 py-4">
        <Skeleton className="h-8 w-24 rounded" />
      </TableCell>
      <TableCell className="px-4 py-4">
        <Skeleton className="h-8 w-24 rounded" />
      </TableCell>
      <TableCell className="px-4 py-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-3 w-8" />
        </div>
      </TableCell>
      <TableCell className="px-4 py-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-14" />
        </div>
      </TableCell>
      <TableCell className="px-4 py-4">
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell className="px-4 py-4">
        <Skeleton className="h-6 w-20 rounded" />
      </TableCell>
      <TableCell className="px-4 py-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </TableCell>
    </TableRow>
  )

  // Load transactions on component mount and when filters change
  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const filters = {
          status: statusFilter,
          category: categoryFilter,
          limit: 100
        }
        
        const data = await fetchTransactions(filters)
        
        if (data.success) {
          setTransactions(data.transactions)
          setSummary(data.summary)
          
          // Extract unique categories
          const uniqueCategories = [...new Set(data.transactions.map(t => t.category))]
          setCategories(uniqueCategories)
        } else {
          setError(data.error || 'Failed to load transactions')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [statusFilter, categoryFilter])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-600" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-slate-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  const getBrandIcon = (brand) => {
    switch (brand) {
      case 'visa':
        return '💳'
      case 'mastercard':
        return '💳'
      case 'paypal':
        return '🅿️'
      default:
        return '💳'
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.expertName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.expertEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  }).sort((a, b) => {
    const aValue = sortBy === 'paymentDate' ? new Date(a[sortBy]) : a[sortBy]
    const bValue = sortBy === 'paymentDate' ? new Date(b[sortBy]) : b[sortBy]
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    }
    return aValue < bValue ? 1 : -1
  })

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const getSortLabel = () => {
    const labels = {
      'paymentDate': 'Date',
      'amount': 'Amount',
      'expertName': 'Expert Name',
      'status': 'Status',
      'serialId': 'Serial No.'
    }
    return `${labels[sortBy]} (${sortOrder === 'asc' ? 'A-Z' : 'Z-A'})`
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ArrowLeftRight className="h-6 w-6 text-blue-600" />
            </div>
            Billing & Transactions
          </h1>
          <p className="text-slate-600 mt-2">
            Comprehensive billing management and transaction history
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading ? (
          <>
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
          </>
        ) : (
          <>
            <Card className="border-0 shadow-sm bg-slate-50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Total Spent</CardTitle>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  ${summary.totalSpent.toLocaleString()}
                </div>
                <p className="text-xs text-emerald-600 mt-1">Total spent amount</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-slate-50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Success Amount</CardTitle>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  ${summary.totalEarned.toLocaleString()}
                </div>
                <p className="text-xs text-slate-600 mt-1">Successfully paid amount</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-slate-50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Failed Amount</CardTitle>
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  ${summary.refundedAmount.toLocaleString()}
                </div>
                <p className="text-xs text-slate-600 mt-1">Failed payments</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-slate-50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">Total Transactions</CardTitle>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Receipt className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {summary.totalTransactions}
                </div>
                <p className="text-xs text-slate-600 mt-1">Across all categories</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>



      <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">Transaction History</CardTitle>
                  <CardDescription>
                    Detailed view of all your payments and billing transactions
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="w-3 h-3" />
                    Last 30 days
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Advanced Filters */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    placeholder="Search transactions, experts, categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 border-slate-200"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-40 border-slate-200">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payment Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full lg:w-40 border-slate-200">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 border-slate-200">
                      <ArrowUpDown className="w-4 h-4" />
                      {getSortLabel()}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="flex items-center gap-2">
                      <SortAsc className="w-4 h-4" />
                      Sort Options
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleSort('paymentDate')} className="flex items-center justify-between">
                      Date
                      {sortBy === 'paymentDate' && (
                        sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('amount')} className="flex items-center justify-between">
                      Amount
                      {sortBy === 'amount' && (
                        sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('expertName')} className="flex items-center justify-between">
                      Expert Name
                      {sortBy === 'expertName' && (
                        sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('status')} className="flex items-center justify-between">
                      Status
                      {sortBy === 'status' && (
                        sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('serialId')} className="flex items-center justify-between">
                      Serial No.
                      {sortBy === 'serialId' && (
                        sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="rounded-lg border border-slate-200 overflow-hidden w-full">
                <div className="overflow-x-auto">
                  <Table className="w-full min-w-full">
                  <TableHeader className="bg-slate-50">
                    <TableRow className="hover:bg-slate-50 h-14">
                      <TableHead className="font-semibold text-slate-700 min-w-[50px] w-[60px] px-4 py-3 text-center">S.No</TableHead>
                      <TableHead className="font-semibold text-slate-700 min-w-[250px] px-4 py-3">Expert & Session Details</TableHead>
                      <TableHead className="font-semibold text-slate-700 min-w-[120px] w-[140px] px-4 py-3">Payment ID</TableHead>
                      <TableHead className="font-semibold text-slate-700 min-w-[120px] w-[140px] px-4 py-3">Order ID</TableHead>
                      <TableHead className="font-semibold text-slate-700 min-w-[80px] w-[100px] px-4 py-3">Amount</TableHead>
                      <TableHead className="font-semibold text-slate-700 min-w-[70px] w-[90px] px-4 py-3">Tax</TableHead>
                      <TableHead className="font-semibold text-slate-700 min-w-[80px] w-[100px] px-4 py-3">Date</TableHead>
                      <TableHead className="font-semibold text-slate-700 min-w-[80px] w-[100px] px-4 py-3">Payment Status</TableHead>
                      <TableHead className="font-semibold text-slate-700 min-w-[80px] w-[100px] px-4 py-3 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <>
                        <TransactionRowSkeleton />
                        <TransactionRowSkeleton />
                        <TransactionRowSkeleton />
                        <TransactionRowSkeleton />
                        <TransactionRowSkeleton />
                      </>
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-96 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <AlertCircle className="w-8 h-8 text-red-400" />
                            <p className="text-red-600">Error loading transactions</p>
                            <p className="text-sm text-slate-500">{error}</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => window.location.reload()}
                              className="mt-2"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Retry
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-96 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <FileText className="w-8 h-8 text-slate-400" />
                            <p className="text-slate-600">No transactions found</p>
                            <p className="text-sm text-slate-500">Try adjusting your search filters</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.map((transaction, index) => (
                        <TableRow key={transaction.id} className="hover:bg-slate-50 h-20 border-b">
                          <TableCell className="font-medium text-slate-900 px-4 py-4 text-center">
                            {transaction.serialId}
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <div className="space-y-2">
                              <div className="font-medium text-slate-900 flex items-center gap-2">
                                {transaction.expertName}
                                <Badge variant="outline" className="text-xs">
                                  {transaction.category}
                                </Badge>
                              </div>
                              <div className="text-sm text-slate-600">{transaction.expertEmail}</div>
                              <div className="text-xs text-slate-500 font-medium">
                                {transaction.sessionTitle}
                              </div>
                              <div className="text-xs text-slate-500">
                                Duration: {transaction.duration || 'N/A'}min
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <div className="font-mono text-xs text-slate-900 bg-slate-50 px-3 py-2 rounded">
                              {transaction.paymentId || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <div className="font-mono text-xs text-slate-900 bg-slate-50 px-3 py-2 rounded">
                              {transaction.orderId || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <div className="space-y-2">
                              <div className={`font-semibold text-lg ${
                                transaction.amount < 0 ? 'text-red-600' : 'text-emerald-600'
                              }`}>
                                {transaction.amount < 0 ? '-' : ''}${Math.abs(transaction.amount).toFixed(2)}
                              </div>
                              <div className="text-xs text-slate-500 font-medium">
                                {transaction.currency}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <div className="space-y-2">
                              <div className="font-medium text-slate-700">
                                ${Math.abs(transaction.tax).toFixed(2)}
                              </div>
                              <div className="text-xs text-slate-500">
                                Fee: ${Math.abs(transaction.serviceFee).toFixed(2)}
                              </div>
                              <div className="text-xs font-medium text-emerald-600">
                                Net: ${Math.abs(transaction.netAmount).toFixed(2)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-4 text-slate-700 text-sm">
                            <div>
                              {new Date(transaction.paymentDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: '2-digit'
                              })}
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <Badge 
                              variant="outline" 
                              className={`${getStatusColor(transaction.status)} font-medium`}
                            >
                              <div className="flex items-center gap-1.5">
                                {getStatusIcon(transaction.status)}
                                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <div className="flex items-center justify-center">
                              <Drawer direction="right">
                                <DrawerTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100" title="View Details">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </DrawerTrigger>
                                <DrawerContent direction="right" className="w-[500px] sm:w-[600px] lg:w-[700px]">
                                  <DrawerHeader className="text-left px-6 py-4 border-b flex-shrink-0">
                                    <DrawerTitle className="text-xl font-semibold">Transaction Details</DrawerTitle>
                                    <DrawerDescription className="text-slate-600">
                                      Complete details for transaction #{transaction.serialId}
                                    </DrawerDescription>
                                  </DrawerHeader>
                                  <div className="px-6 py-6 space-y-8 overflow-y-auto flex-1 min-h-0">                                    {/* Session Information */}
                                    <div className="space-y-4">
                                      <div className="flex items-center gap-2">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                          <Calendar className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <h4 className="font-semibold text-lg">Session Information</h4>
                                      </div>
                                      <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                          <span className="text-slate-600 font-medium">Expert:</span>
                                          <span className="font-semibold text-slate-900">{transaction.expertName}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                          <span className="text-slate-600 font-medium">Expert Email:</span>
                                          <span className="text-slate-900">{transaction.expertEmail}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                          <span className="text-slate-600 font-medium">Category:</span>
                                          <Badge variant="outline" className="text-xs">
                                            {transaction.category}
                                          </Badge>
                                        </div>
                                        {transaction.categories && transaction.categories.length > 1 && (
                                          <div className="py-2 border-b border-slate-100">
                                            <div className="flex justify-between items-start mb-2">
                                              <span className="text-slate-600 font-medium">All Categories:</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                              {transaction.categories.map((cat, idx) => (
                                                <Badge key={idx} variant="secondary" className="text-xs">
                                                  {cat}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                          <span className="text-slate-600 font-medium">Session Title:</span>
                                          <span className="font-semibold text-slate-900 text-right max-w-[200px]">{transaction.sessionTitle}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                          <span className="text-slate-600 font-medium">Session Type:</span>
                                          <span className="capitalize text-slate-900">{transaction.sessionTypeDetail || 'One-on-one'}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                          <span className="text-slate-600 font-medium">Duration:</span>
                                          <span className="text-slate-900">{transaction.duration || 'N/A'} minutes</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                          <span className="text-slate-600 font-medium">Platform:</span>
                                          <span className="capitalize text-slate-900">
                                            {transaction.platform || 'N/A'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    {/* Payment Information */}
                                    <div className="space-y-4">
                                      <div className="flex items-center gap-2">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                          <CreditCard className="h-4 w-4 text-green-600" />
                                        </div>
                                        <h4 className="font-semibold text-lg">Payment Information</h4>
                                      </div>
                                      <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                          <span className="text-slate-600 font-medium">Payment Status:</span>
                                          <Badge 
                                            variant="outline" 
                                            className={`${getStatusColor(transaction.status)} font-medium`}
                                          >
                                            <div className="flex items-center gap-1.5">
                                              {getStatusIcon(transaction.status)}
                                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                            </div>
                                          </Badge>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                          <span className="text-slate-600 font-medium">Payment ID:</span>
                                          <span className="font-mono text-xs bg-slate-50 px-2 py-1 rounded">
                                            {transaction.paymentId || 'N/A'}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                          <span className="text-slate-600 font-medium">Order ID:</span>
                                          <span className="font-mono text-xs bg-slate-50 px-2 py-1 rounded">
                                            {transaction.orderId || 'N/A'}
                                          </span>
                                        </div>
                                        {transaction.invoiceNumber && (
                                          <div className="flex justify-between items-center py-2">
                                            <span className="text-slate-600 font-medium">Invoice:</span>
                                            <span className="font-mono text-xs bg-slate-50 px-2 py-1 rounded">
                                              {transaction.invoiceNumber}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    {/* Payment Breakdown */}
                                    <div className="space-y-4">
                                      <div className="flex items-center gap-2">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                          <DollarSign className="h-4 w-4 text-purple-600" />
                                        </div>
                                        <h4 className="font-semibold text-lg">Payment Breakdown</h4>
                                      </div>
                                      <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                          <span className="text-slate-600 font-medium">Session Fee:</span>
                                          <span className="font-semibold text-slate-900">
                                            ${(transaction.amount - transaction.tax - transaction.serviceFee).toFixed(2)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                          <span className="text-slate-600 font-medium">Service Fee:</span>
                                          <span className="text-slate-900">${transaction.serviceFee.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                          <span className="text-slate-600 font-medium">Tax:</span>
                                          <span className="text-slate-900">${transaction.tax.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 bg-slate-50 rounded-lg px-3">
                                          <span className="text-slate-900 font-semibold">Total Amount:</span>
                                          <span className="text-lg font-bold text-slate-900">
                                            ${transaction.amount.toFixed(2)} {transaction.currency}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </DrawerContent>
                              </Drawer>
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                disabled={transaction.status !== 'success'}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
              
            </CardContent>
          </Card>
    </div>
  )
}