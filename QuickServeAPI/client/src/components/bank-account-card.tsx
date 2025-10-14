import { useState } from 'react';
import { useFormatCurrency } from '@/lib/utils/formatCurrency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import {
  Building,
  CreditCard,
  Calendar,
  AlertTriangle,
  PiggyBank,
  Plus,
  History,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
} from 'lucide-react';
import AccountTransactionForm from './account-transaction-form';

interface BankProduct {
  id: string;
  bankName: string;
  accountName: string;
  type: 'personal' | 'company';
  currency: string;
  hasCheckingAccount: boolean;
  hasCreditCard: boolean;
  hasLoan: boolean;
  hasOverdraft: boolean;
  hasSavings: boolean;
  // Credit card details
  creditCardCutOffDate?: string;
  creditCardDueDate?: string;
  creditCardGracePeriod?: string;
  creditCardMinimumPayment?: string;
  creditCardInterestRate?: string;
  // Loan details
  loanDueDate?: string;
  loanGracePeriod?: string;
  loanMinimumPayment?: string;
  loanInterestRate?: string;
  // Overdraft details
  overdraftLimit?: string;
  overdraftInterestRate?: string;
}

interface BankAccountCardProps {
  bank: BankProduct;
  onAddTransaction: (data: any) => void;
  onViewHistory: (bankId: string) => void;
  onEditAccount?: (bank: BankProduct) => void;
  onDeleteAccount?: (accountId: string) => void;
  formatCurrency?: (amount: number) => string;
}

export default function BankAccountCard({
  formatCurrency = useFormatCurrency(),
  bank,
  onAddTransaction,
  onViewHistory,
  onEditAccount,
  onDeleteAccount,
}: BankAccountCardProps) {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const getProductIcon = (productType: string) => {
    switch (productType) {
      case 'checking':
        return <Building className="w-4 h-4" />;
      case 'creditCard':
        return <CreditCard className="w-4 h-4" />;
      case 'loan':
        return <Calendar className="w-4 h-4" />;
      case 'overdraft':
        return <AlertTriangle className="w-4 h-4" />;
      case 'savings':
        return <PiggyBank className="w-4 h-4" />;
      default:
        return <Building className="w-4 h-4" />;
    }
  };

  const getProductName = (productType: string) => {
    switch (productType) {
      case 'checking':
        return 'Vadesiz Hesap';
      case 'creditCard':
        return 'Kredi Kartı';
      case 'loan':
        return 'Kredi';
      case 'overdraft':
        return 'KMH';
      case 'savings':
        return 'Vadeli Hesap';
      default:
        return 'Hesap';
    }
  };

  const getProductColor = (productType: string) => {
    switch (productType) {
      case 'checking':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'creditCard':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'loan':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      case 'overdraft':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'savings':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-300';
    }
  };

  const getPaymentInfo = (productType: string) => {
    switch (productType) {
      case 'creditCard':
        return bank.creditCardDueDate
          ? `Son ödeme: Ayın ${bank.creditCardDueDate}'i`
          : null;
      case 'loan':
        return bank.loanDueDate ? `Taksit: Ayın ${bank.loanDueDate}'i` : null;
      default:
        return null;
    }
  };

  const getMinimumPayment = (productType: string) => {
    switch (productType) {
      case 'creditCard':
        return bank.creditCardMinimumPayment
          ? formatCurrency(parseFloat(bank.creditCardMinimumPayment))
          : null;
      case 'loan':
        return bank.loanMinimumPayment
          ? formatCurrency(parseFloat(bank.loanMinimumPayment))
          : null;
      default:
        return null;
    }
  };

  const getInterestRate = (productType: string) => {
    switch (productType) {
      case 'creditCard':
        return bank.creditCardInterestRate
          ? `%${bank.creditCardInterestRate}`
          : null;
      case 'loan':
        return bank.loanInterestRate ? `%${bank.loanInterestRate}` : null;
      case 'overdraft':
        return bank.overdraftInterestRate
          ? `%${bank.overdraftInterestRate}`
          : null;
      default:
        return null;
    }
  };

  const products = [
    { type: 'checking', active: bank.hasCheckingAccount },
    { type: 'creditCard', active: bank.hasCreditCard },
    { type: 'loan', active: bank.hasLoan },
    { type: 'overdraft', active: bank.hasOverdraft },
    { type: 'savings', active: bank.hasSavings },
  ].filter(p => p.active);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <CardTitle className="text-lg">{bank.bankName}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {bank.accountName}
              </p>
            </div>
          </div>
          <Badge variant={bank.type === 'company' ? 'default' : 'secondary'}>
            {bank.type === 'company' ? 'Şirket' : 'Kişisel'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bank Products */}
        <div className="space-y-3">
          {products.map(product => (
            <div
              key={product.type}
              className="border rounded-lg p-3 bg-gray-50/50"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getProductIcon(product.type)}
                  <span className="font-medium">
                    {getProductName(product.type)}
                  </span>
                  <Badge className={getProductColor(product.type)}>Aktif</Badge>
                </div>
                <div className="flex flex-col sm:flex-row gap-1 sm:justify-end">
                  {/* İşlem Butonu - Her zaman görünür */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setSelectedProduct(
                        selectedProduct === product.type ? null : product.type
                      )
                    }
                    className="text-xs px-2 py-1 h-7 w-full sm:w-auto"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    <span>İşlem</span>
                  </Button>

                  {/* Diğer Butonlar - Mobile'da 2 satır */}
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewHistory(bank.id)}
                      className="text-xs px-2 py-1 h-7 flex-1 sm:flex-none"
                      title="Geçmiş"
                    >
                      <History className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEditAccount?.(bank)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs px-2 py-1 h-7 flex-1 sm:flex-none"
                      title="Düzenle"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteAccount?.(bank.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs px-2 py-1 h-7 flex-1 sm:flex-none"
                      title="Sil"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
                {getPaymentInfo(product.type) && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {getPaymentInfo(product.type)}
                  </div>
                )}
                {getMinimumPayment(product.type) && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {getMinimumPayment(product.type)}
                  </div>
                )}
                {getInterestRate(product.type) && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {getInterestRate(product.type)}
                  </div>
                )}
                {product.type === 'overdraft' && bank.overdraftLimit && (
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Limit: {formatCurrency(parseFloat(bank.overdraftLimit))}
                  </div>
                )}
              </div>

              {/* Transaction Form */}
              {selectedProduct === product.type && (
                <div className="mt-3 pt-3 border-t">
                  <AccountTransactionForm
                    account={{
                      id: bank.id,
                      accountName: bank.accountName,
                      bankName: bank.bankName,
                      name: bank.accountName,
                      type: bank.type as 'cash' | 'bank' | 'credit' | 'investment' | 'company',
                      currency: bank.currency,
                      balance: 0, // Will be fetched from backend
                    }}
                    subAccount={
                      product.type === 'creditCard'
                        ? {
                          id: `${bank.id}_creditCard`,
                          parentAccountId: bank.id,
                          name: 'Kredi Kartı',
                          balance: 0,
                          type: 'creditCard' as const,
                          limit: parseFloat(
                            bank.creditCardMinimumPayment || '0'
                          ),
                          used: 0,
                          cutOffDate: (parseInt(
                            bank.creditCardCutOffDate || '15'
                          )).toString(),
                          paymentDueDate: (parseInt(
                            bank.creditCardDueDate || '25'
                          )).toString(),
                          minimumPayment: parseFloat(
                            bank.creditCardMinimumPayment || '0'
                          ),
                          interestRate: parseFloat(
                            bank.creditCardInterestRate || '0'
                          ),
                        }
                        : product.type === 'loan'
                          ? {
                            id: `${bank.id}_loan`,
                            parentAccountId: bank.id,
                            name: 'Kredi',
                            balance: 0,
                            type: 'loan' as const,
                            principalRemaining: parseFloat(
                              bank.loanMinimumPayment || '0'
                            ),
                            monthlyPayment: parseFloat(
                              bank.loanMinimumPayment || '0'
                            ),
                            dueDate: parseInt(bank.loanDueDate || '15').toString(),
                            interestRate: parseFloat(
                              bank.loanInterestRate || '0'
                            ),
                          }
                          : product.type === 'overdraft'
                            ? {
                              id: `${bank.id}_overdraft`,
                              parentAccountId: bank.id,
                              name: 'Kredi Limiti',
                              balance: 0,
                              type: 'kmh' as const,
                              limit: parseFloat(bank.overdraftLimit || '0'),
                              used: 0,
                              interestRate: parseFloat(
                                bank.overdraftInterestRate || '0'
                              ),
                            }
                            : product.type === 'savings'
                              ? {
                                id: `${bank.id}_savings`,
                                parentAccountId: bank.id,
                                name: 'Birikim',
                                balance: 0,
                                type: 'deposit' as const,
                                interestRate: 0,
                              }
                              : undefined
                    }
                    onAddTransaction={onAddTransaction}
                    onClose={() => setSelectedProduct(null)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bank Summary */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">
              Toplam Ürün:
            </span>
            <span className="font-medium">{products.length} aktif ürün</span>
          </div>

          {/* Payment Alerts */}
          {(bank.hasCreditCard || bank.hasLoan) && (
            <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded text-xs">
              <div className="flex items-center gap-1 text-yellow-700 dark:text-yellow-300">
                <AlertTriangle className="w-3 h-3" />
                <span className="font-medium">Ödeme Hatırlatmaları:</span>
              </div>
              <div className="mt-1 space-y-1 text-yellow-800 dark:text-yellow-200">
                {bank.hasCreditCard && bank.creditCardDueDate && (
                  <div>Kredi Kartı: Ayın {bank.creditCardDueDate}'i</div>
                )}
                {bank.hasLoan && bank.loanDueDate && (
                  <div>Kredi Taksit: Ayın {bank.loanDueDate}'i</div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
