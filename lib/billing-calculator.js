// Billing calculation utilities for accurate fee and tax calculations
export class BillingCalculator {
  // Service fee rates (configurable)
  static SERVICE_FEE_RATE = 0.03 // 3% service fee
  static TAX_RATE = 0.08 // 8% tax rate
  
  // Platform-specific fees
  static PLATFORM_FEES = {
    'zoom': 0.02, // 2% additional fee for Zoom
    'google-meet': 0.01, // 1% additional fee for Google Meet
    'default': 0.00
  }


  static calculateFees(baseAmount, platform = 'default', currency = 'USD') {
    if (baseAmount <= 0) {
      throw new Error('Base amount must be positive')
    }

    // Calculate platform fee
    const platformFeeRate = this.PLATFORM_FEES[platform] || this.PLATFORM_FEES.default
    const platformFee = baseAmount * platformFeeRate

    // Calculate service fee on base amount
    const serviceFee = baseAmount * this.SERVICE_FEE_RATE

    // Calculate tax on base amount + platform fee
    const taxableAmount = baseAmount + platformFee
    const tax = taxableAmount * this.TAX_RATE

    // Calculate total amount
    const totalAmount = baseAmount + platformFee + serviceFee + tax

    // Calculate net amount (what the expert receives)
    const netAmount = baseAmount - serviceFee

    return {
      baseAmount: this.roundToCurrency(baseAmount, currency),
      platformFee: this.roundToCurrency(platformFee, currency),
      serviceFee: this.roundToCurrency(serviceFee, currency),
      tax: this.roundToCurrency(tax, currency),
      totalAmount: this.roundToCurrency(totalAmount, currency),
      netAmount: this.roundToCurrency(netAmount, currency),
      breakdown: {
        sessionFee: this.roundToCurrency(baseAmount, currency),
        platformFee: this.roundToCurrency(platformFee, currency),
        serviceFee: this.roundToCurrency(serviceFee, currency),
        tax: this.roundToCurrency(tax, currency)
      }
    }
  }

  /**
   * Calculate refund amounts
   * @param {Object} originalCalculation - Original fee calculation
   * @param {number} refundPercentage - Percentage to refund (0-100)
   * @param {string} currency - Currency code
   * @returns {Object} Refund calculation
   */
  static calculateRefund(originalCalculation, refundPercentage, currency = 'USD') {
    if (refundPercentage < 0 || refundPercentage > 100) {
      throw new Error('Refund percentage must be between 0 and 100')
    }

    const refundRate = refundPercentage / 100
    
    return {
      refundAmount: this.roundToCurrency(originalCalculation.totalAmount * refundRate, currency),
      refundServiceFee: this.roundToCurrency(originalCalculation.serviceFee * refundRate, currency),
      refundTax: this.roundToCurrency(originalCalculation.tax * refundRate, currency),
      refundPlatformFee: this.roundToCurrency(originalCalculation.platformFee * refundRate, currency),
      netRefund: this.roundToCurrency(originalCalculation.netAmount * refundRate, currency)
    }
  }

  /**
   * Round amount to appropriate decimal places for currency
   * @param {number} amount - Amount to round
   * @param {string} currency - Currency code
   * @returns {number} Rounded amount
   */
  static roundToCurrency(amount, currency = 'USD') {
    const decimalPlaces = this.getCurrencyDecimalPlaces(currency)
    return Math.round(amount * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces)
  }

  /**
   * Get decimal places for currency
   * @param {string} currency - Currency code
   * @returns {number} Number of decimal places
   */
  static getCurrencyDecimalPlaces(currency) {
    const currencyDecimalPlaces = {
      'USD': 2,
      'EUR': 2,
      'GBP': 2,
      'INR': 2,
      'JPY': 0,
      'KRW': 0,
      'default': 2
    }
    
    return currencyDecimalPlaces[currency] || currencyDecimalPlaces.default
  }

  /**
   * Validate payment amount against calculated total
   * @param {number} receivedAmount - Amount received from payment processor
   * @param {Object} calculation - Calculated fees
   * @param {string} currency - Currency code
   * @returns {boolean} Whether the amount matches
   */
  static validatePaymentAmount(receivedAmount, calculation, currency = 'USD') {
    const expectedAmount = this.roundToCurrency(calculation.totalAmount, currency)
    const tolerance = 0.01 // Allow 1 cent tolerance for rounding differences
    
    return Math.abs(receivedAmount - expectedAmount) <= tolerance
  }

  /**
   * Generate invoice number
   * @param {string} bookingId - Booking ID
   * @param {string} type - Invoice type (INV, REF, ADJ)
   * @returns {string} Invoice number
   */
  static generateInvoiceNumber(bookingId, type = 'INV') {
    const timestamp = Date.now().toString().slice(-6)
    const bookingSuffix = bookingId.slice(-4).toUpperCase()
    return `${type}-${timestamp}-${bookingSuffix}`
  }

  /**
   * Calculate monthly earnings summary
   * @param {Array} transactions - Array of transaction objects
   * @param {string} month - Month in YYYY-MM format
   * @returns {Object} Monthly summary
   */
  static calculateMonthlySummary(transactions, month) {
    const monthTransactions = transactions.filter(t => {
      const transactionMonth = new Date(t.paymentDate).toISOString().slice(0, 7)
      return transactionMonth === month
    })

    const completedTransactions = monthTransactions.filter(t => t.status === 'confirmed')
    const pendingTransactions = monthTransactions.filter(t => t.status === 'pending')
    const refundedTransactions = monthTransactions.filter(t => t.status === 'cancelled')

    const totalEarned = completedTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.netAmount, 0)

    const totalSpent = completedTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.netAmount), 0)

    const pendingAmount = pendingTransactions
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const refundedAmount = refundedTransactions
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return {
      month,
      totalEarned: this.roundToCurrency(totalEarned),
      totalSpent: this.roundToCurrency(totalSpent),
      pendingAmount: this.roundToCurrency(pendingAmount),
      refundedAmount: this.roundToCurrency(refundedAmount),
      transactionCount: monthTransactions.length,
      completedCount: completedTransactions.length,
      pendingCount: pendingTransactions.length,
      refundedCount: refundedTransactions.length
    }
  }
}

export default BillingCalculator
