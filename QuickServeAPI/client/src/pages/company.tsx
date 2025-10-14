import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import BankAccountDialog from '@/components/bank-account-dialog';
import BankAccountCard from '@/components/bank-account-card';
import AccountTransactionForm from '@/components/account-transaction-form';
import EditAccountDialog from '@/components/edit-account-dialog';
import EditTransactionDialog from '@/components/edit-transaction-dialog';
import { apiRequest } from '@/lib/queryClient';
import { logger } from '@/lib/utils/logger';
import { useFormatCurrency } from '@/lib/utils/formatCurrency';
import type { Account, Transaction } from '@/lib/types';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { memo, useMemo } from 'react';

export default function Company() {
  const formatCurrency = useFormatCurrency();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [showAddAccountDialog, setShowAddAccountDialog] = useState(false);
  const [selectedAccountForTransaction, setSelectedAccountForTransaction] =
    useState<string | null>(null);
  const [isAddingAccount, setIsAddingAccount] = useState(false);

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editTransactionDialogOpen, setEditTransactionDialogOpen] =
    useState(false);
  const [deleteTransactionDialogOpen, setDeleteTransactionDialogOpen] =
    useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(
    null
  );
  const [newAccountName, setNewAccountName] = useState('');
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<
    string | null
  >(null);

  // Fetch company accounts
  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['/api/accounts', 'company'], // Unique queryKey for company accounts
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/accounts');
      const data = await response.json();
      logger.info('🏢 Company: Fetched all accounts:', data);
      const companyAccounts = data.filter(
        (account: Account) => account.type === 'company'
      );
      logger.info('🏢 Company: Filtered company accounts:', companyAccounts);
      return companyAccounts;
    },
    staleTime: 30000,
  });

  // Fetch transactions for selected account
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/transactions', selectedAccount],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedAccount !== 'all') {
        params.append('accountId', selectedAccount);
      }
      params.append('limit', '50');

      const response = await apiRequest('GET', `/api/transactions?${params}`);
      return response.json();
    },
    enabled: selectedAccount !== 'all',
    staleTime: 30000,
  });

  const filteredAccounts = useMemo(
    () =>
      accounts.filter(
        (account: Account) =>
          account.accountName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          account.bankName?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [accounts, searchTerm]
  );

  const totalCompanyBalance = accounts.reduce(
    (sum: number, account: Account) => sum + account.balance,
    0
  );

  // Add transaction function
  const handleAddTransaction = async (transactionData: any) => {
    try {
      const response = await apiRequest(
        'POST',
        '/api/transactions',
        transactionData
      );
      if (response.ok) {
        // Invalidate and refetch data instead of reloading page
        await queryClient.invalidateQueries({
          queryKey: ['/api/accounts', 'company'],
        });
        await queryClient.invalidateQueries({
          queryKey: ['/api/accounts', 'personal'],
        });
        await queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      }
    } catch (error) {
      logger.error('Error adding transaction:', error);
    }
  };

  // Add account function
  const handleAddAccount = async (accountData: any) => {
    // Validate required fields
    if (
      !accountData.name ||
      !accountData.type ||
      accountData.balance === undefined
    ) {
      alert('Lütfen tüm alanları doldurun!');
      return;
    }

    setIsAddingAccount(true);
    try {
      logger.info('Sending account data:', accountData);
      const response = await apiRequest('POST', '/api/accounts', accountData);
      logger.info('Account response:', response);

      if (response.ok) {
        logger.info('✅ Company: Account added successfully');
        setShowAddAccountDialog(false);
        // Invalidate and refetch accounts data instead of reloading page
        await queryClient.invalidateQueries({
          queryKey: ['/api/accounts', 'company'],
        });
        await queryClient.invalidateQueries({
          queryKey: ['/api/accounts', 'personal'],
        });
        await queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
        logger.info('🔄 Company: Cache invalidated, data will refresh');
      } else {
        const errorData = await response.json();
        logger.error('❌ Company: API error:', errorData);
        alert(
          `❌ Hesap eklenirken hata: ${errorData.error || errorData.message || 'Bilinmeyen hata'}`
        );
      }
    } catch (error) {
      logger.error('Error adding account:', error);
      alert('Hesap eklenirken hata oluştu!');
    } finally {
      setIsAddingAccount(false);
    }
  };

  // Edit account function
  const handleEditAccount = async (accountId: string, updatedData: any) => {
    try {
      const response = await apiRequest(
        'PUT',
        `/api/accounts/${accountId}`,
        updatedData
      );
      if (response.ok) {
        logger.info('✅ Company: Account updated successfully');
        toast({
          title: '✅ Başarılı',
          description: 'Hesap başarıyla güncellendi!',
        });
        // Invalidate and refetch accounts data
        await queryClient.invalidateQueries({
          queryKey: ['/api/accounts', 'company'],
        });
        await queryClient.invalidateQueries({
          queryKey: ['/api/accounts', 'personal'],
        });
        await queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
        setEditDialogOpen(false);
        setEditingAccount(null);
        setNewAccountName('');
      } else {
        const errorData = await response.json();
        logger.error('❌ Company: API error:', errorData);
        toast({
          title: '❌ Hata',
          description: `Hesap güncellenirken hata: ${errorData.error || 'Bilinmeyen hata'}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      logger.error('❌ Company: Error updating account:', error);
      toast({
        title: '❌ Hata',
        description: 'Hesap güncellenirken hata oluştu!',
        variant: 'destructive',
      });
    }
  };

  // Delete account function
  const handleDeleteAccount = async (accountId: string) => {
    try {
      const response = await apiRequest('DELETE', `/api/accounts/${accountId}`);
      if (response.ok) {
        logger.info('✅ Company: Account deleted successfully');
        toast({
          title: '✅ Başarılı',
          description: 'Hesap başarıyla silindi!',
        });
        // Invalidate and refetch accounts data
        await queryClient.invalidateQueries({
          queryKey: ['/api/accounts', 'company'],
        });
        await queryClient.invalidateQueries({
          queryKey: ['/api/accounts', 'personal'],
        });
        await queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
        setDeleteDialogOpen(false);
        setDeletingAccountId(null);
      } else {
        const errorData = await response.json();
        logger.error('❌ Company: API error:', errorData);
        toast({
          title: '❌ Hata',
          description: `Hesap silinirken hata: ${errorData.error || 'Bilinmeyen hata'}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      logger.error('❌ Company: Error deleting account:', error);
      toast({
        title: '❌ Hata',
        description: 'Hesap silinirken hata oluştu!',
        variant: 'destructive',
      });
    }
  };

  // Edit transaction function
  const handleEditTransaction = async (
    transactionId: string,
    updatedData: any
  ) => {
    try {
      const response = await apiRequest(
        'PUT',
        `/api/transactions/${transactionId}`,
        updatedData
      );
      if (response.ok) {
        logger.info('✅ Company: Transaction updated successfully');
        toast({
          title: '✅ Başarılı',
          description: 'İşlem başarıyla güncellendi!',
        });
        // Invalidate and refetch transactions data
        await queryClient.invalidateQueries({
          queryKey: ['/api/transactions', selectedAccount],
        });
        setEditTransactionDialogOpen(false);
        setEditingTransaction(null);
      } else {
        const errorData = await response.json();
        logger.error('❌ Company: API error:', errorData);
        toast({
          title: '❌ Hata',
          description: `İşlem güncellenirken hata: ${errorData.error || 'Bilinmeyen hata'}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      logger.error('❌ Company: Error updating transaction:', error);
      toast({
        title: '❌ Hata',
        description: 'İşlem güncellenirken hata oluştu!',
        variant: 'destructive',
      });
    }
  };

  // Delete transaction function
  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      const response = await apiRequest(
        'DELETE',
        `/api/transactions/${transactionId}`
      );
      if (response.ok) {
        logger.info('✅ Company: Transaction deleted successfully');
        toast({
          title: '✅ Başarılı',
          description: 'İşlem başarıyla silindi!',
        });
        // Invalidate and refetch transactions data
        await queryClient.invalidateQueries({
          queryKey: ['/api/transactions', selectedAccount],
        });
        setDeleteTransactionDialogOpen(false);
        setDeletingTransactionId(null);
      } else {
        const errorData = await response.json();
        logger.error('❌ Company: API error:', errorData);
        toast({
          title: '❌ Hata',
          description: `İşlem silinirken hata: ${errorData.error || 'Bilinmeyen hata'}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      logger.error('❌ Company: Error deleting transaction:', error);
      toast({
        title: '❌ Hata',
        description: 'İşlem silinirken hata oluştu!',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" data-testid="page-title">
          Şirket Hesapları
        </h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            Toplam: {formatCurrency(totalCompanyBalance)}
          </Badge>
          <Button
            onClick={() => setShowAddAccountDialog(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Hesap Ekle
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <Input
          placeholder="Hesap ara..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={selectedAccount} onValueChange={setSelectedAccount}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Hesap seç" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Hesaplar</SelectItem>
            {filteredAccounts.map((account: Account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.accountName} ({account.bankName})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Accounts Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {filteredAccounts.map((account: Account) => {
          // Parse subAccounts if they exist
          const subAccounts = account.subAccounts || [];

          // Convert account to BankProduct format
          const bankProduct = {
            id: account.id,
            bankName: account.bankName || 'Bilinmeyen Banka',
            accountName: account.accountName || 'Bilinmeyen Hesap',
            type: account.type as 'personal' | 'company',
            currency: account.currency || 'TRY',
            hasCheckingAccount: true, // Main account is always checking
            hasCreditCard: subAccounts.some(
              (sub: any) => sub.type === 'creditCard'
            ),
            hasLoan: subAccounts.some((sub: any) => sub.type === 'loan'),
            hasOverdraft: subAccounts.some((sub: any) => sub.type === 'kmh'),
            hasSavings: subAccounts.some((sub: any) => sub.type === 'deposit'),
            // All numeric fields with defaults
            checkingAccountRate: 0,
            creditCardRate: subAccounts.find(
              (sub: any) => sub.type === 'creditCard'
            )?.interestRate || 0,
            loanRate: subAccounts.find(
              (sub: any) => sub.type === 'loan'
            )?.interestRate || 0,
            overdraftRate: subAccounts.find(
              (sub: any) => sub.type === 'kmh'
            )?.interestRate || 0,
            checkingAccountLimit: 0,
            creditCardLimit: subAccounts.find(
              (sub: any) => sub.type === 'creditCard'
            )?.limit || 0,
            loanLimit: 0,
            overdraftLimit: subAccounts.find(
              (sub: any) => sub.type === 'kmh'
            )?.limit || 0,
            checkingAccountMinBalance: 0,
            creditCardMinPayment: subAccounts.find(
              (sub: any) => sub.type === 'creditCard'
            )?.minimumPayment || 0,
            loanMinPayment: subAccounts.find(
              (sub: any) => sub.type === 'loan'
            )?.monthlyPayment || 0,
            overdraftMinBalance: 0,
            checkingAccountFee: 0,
            creditCardFee: 0,
            loanFee: 0,
            overdraftFee: 0,
            checkingAccountInterestRate: 0,
            creditCardInterestRate: subAccounts.find(
              (sub: any) => sub.type === 'creditCard'
            )?.interestRate || 0,
            loanInterestRate: subAccounts.find(
              (sub: any) => sub.type === 'loan'
            )?.interestRate || 0,
            overdraftInterestRate: subAccounts.find(
              (sub: any) => sub.type === 'kmh'
            )?.interestRate || 0,
          };

          return (
            <BankAccountCard
              key={account.id}
              bank={bankProduct}
              onAddTransaction={handleAddTransaction}
              onViewHistory={bankId => {
                setSelectedAccount(bankId);
                // Scroll to transactions table
                setTimeout(() => {
                  const transactionsSection = document.querySelector(
                    '[data-testid="transactions-section"]'
                  );
                  if (transactionsSection) {
                    transactionsSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }, 100);
              }}
              onEditAccount={bank => {
                // Open edit dialog with current account data
                const account = accounts.find((a: Account) => a.id === bank.id);
                if (account) {
                  setEditingAccount(account);
                  setNewAccountName(account.accountName);
                  setEditDialogOpen(true);
                }
              }}
              onDeleteAccount={accountId => {
                setDeletingAccountId(accountId);
                setDeleteDialogOpen(true);
              }}
            />
          );
        })}
      </div>

      {/* Transactions Table */}
      {selectedAccount !== 'all' && (
        <Card data-testid="transactions-section">
          <CardHeader>
            <CardTitle>İşlem Geçmişi</CardTitle>
            <CardDescription>
              {accounts.find((a: Account) => a.id === selectedAccount)?.name}{' '}
              hesabının son işlemleri
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="text-center py-8">İşlemler yükleniyor...</div>
            ) : transactionsData?.transactions?.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Tür</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionsData.transactions.map(
                    (transaction: Transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {new Date(transaction.date).toLocaleDateString(
                            'tr-TR'
                          )}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.type === 'income'
                                ? 'default'
                                : 'destructive'
                            }
                          >
                            {transaction.type === 'income' ? 'Gelir' : 'Gider'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingTransaction(transaction);
                                setEditTransactionDialogOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeletingTransactionId(transaction.id);
                                setDeleteTransactionDialogOpen(true);
                              }}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Bu hesap için henüz işlem bulunmuyor.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {filteredAccounts.length === 0 && !accountsLoading && (
        <Card>
          <CardContent className="text-center py-16">
            <h3 className="text-lg font-semibold mb-2">
              Şirket Hesabı Bulunamadı
            </h3>
            <p className="text-muted-foreground">
              Henüz şirket hesabınız bulunmuyor. Yeni hesap ekleyebilirsiniz.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Account Dialog */}
      <BankAccountDialog
        open={showAddAccountDialog}
        onOpenChange={setShowAddAccountDialog}
        onAddBankAccount={handleAddAccount}
        isLoading={isAddingAccount}
        defaultAccountType="company"
        allowTypeChange={false}
      />

      {/* Account Specific Transaction Form */}
      {selectedAccountForTransaction && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-blue-700">
                {
                  accounts.find(
                    (a: Account) => a.id === selectedAccountForTransaction
                  )?.accountName
                }{' '}
                - Yeni İşlem
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAccountForTransaction(null)}
              >
                ✕
              </Button>
            </div>
            <CardDescription>
              {
                accounts.find(
                  (a: Account) => a.id === selectedAccountForTransaction
                )?.bankName
              }{' '}
              hesabına işlem ekleyin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AccountTransactionForm
              account={
                accounts.find(
                  (a: Account) => a.id === selectedAccountForTransaction
                )!
              }
              onAddTransaction={handleAddTransaction}
              onClose={() => setSelectedAccountForTransaction(null)}
            />
          </CardContent>
        </Card>
      )}

      {/* Edit Account Dialog */}
      <EditAccountDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdateAccount={handleEditAccount}
        account={editingAccount}
        isLoading={false}
      />

      {/* Delete Account Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hesabı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu hesabı silmek istediğinizden emin misiniz? Bu işlem geri
              alınamaz ve hesaptaki tüm veriler silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingAccountId(null);
              }}
            >
              İptal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingAccountId) {
                  handleDeleteAccount(deletingAccountId);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Transaction Dialog */}
      <EditTransactionDialog
        open={editTransactionDialogOpen}
        onOpenChange={setEditTransactionDialogOpen}
        onUpdateTransaction={handleEditTransaction}
        transaction={editingTransaction}
        accounts={accounts}
        isLoading={false}
      />

      {/* Delete Transaction Dialog */}
      <AlertDialog
        open={deleteTransactionDialogOpen}
        onOpenChange={setDeleteTransactionDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>İşlemi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlemi silmek istediğinizden emin misiniz? Bu işlem geri
              alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteTransactionDialogOpen(false);
                setDeletingTransactionId(null);
              }}
            >
              İptal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingTransactionId) {
                  handleDeleteTransaction(deletingTransactionId);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
