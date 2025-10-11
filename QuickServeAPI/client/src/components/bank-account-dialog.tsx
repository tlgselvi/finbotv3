import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  User,
  Building,
  CreditCard,
  Calendar,
  PiggyBank,
  AlertTriangle,
} from 'lucide-react';
import { logger } from '@/lib/logger';

interface BankAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddBankAccount: (data: any) => void;
  isLoading: boolean;
  defaultAccountType?: 'personal' | 'company';
  allowTypeChange?: boolean; // Hesap türü değiştirmeye izin ver
}

export default function BankAccountDialog({
  open,
  onOpenChange,
  onAddBankAccount,
  isLoading,
  defaultAccountType = 'personal',
  allowTypeChange = true,
}: BankAccountDialogProps) {
  const [accountType, setAccountType] = useState<'personal' | 'company'>(
    defaultAccountType
  );
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');

  // Product selections
  const [hasCheckingAccount, setHasCheckingAccount] = useState(true); // Default: Vadesiz Hesap seçili
  const [hasCreditCard, setHasCreditCard] = useState(false);
  const [hasLoan, setHasLoan] = useState(false);
  const [hasOverdraft, setHasOverdraft] = useState(false);
  const [hasSavings, setHasSavings] = useState(false);

  // Credit card details
  const [creditCardCutOffDate, setCreditCardCutOffDate] = useState('');
  const [creditCardDueDate, setCreditCardDueDate] = useState('');
  const [creditCardGracePeriod, setCreditCardGracePeriod] = useState('');
  const [creditCardMinimumPayment, setCreditCardMinimumPayment] = useState('');
  const [creditCardInterestRate, setCreditCardInterestRate] = useState('');

  // Loan details
  const [loanDueDate, setLoanDueDate] = useState('');
  const [loanGracePeriod, setLoanGracePeriod] = useState('');
  const [loanMinimumPayment, setLoanMinimumPayment] = useState('');
  const [loanInterestRate, setLoanInterestRate] = useState('');

  // Overdraft details
  const [overdraftLimit, setOverdraftLimit] = useState('');
  const [overdraftInterestRate, setOverdraftInterestRate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: Required fields
    if (!bankName.trim()) {
      alert('❌ Banka adı zorunludur!');
      return;
    }

    if (!accountName.trim()) {
      alert('❌ Hesap adı zorunludur!');
      return;
    }

    // Validation: At least one product must be selected
    if (
      !hasCheckingAccount &&
      !hasCreditCard &&
      !hasLoan &&
      !hasOverdraft &&
      !hasSavings
    ) {
      alert('❌ En az bir banka ürünü seçmelisiniz!');
      return;
    }

    logger.info('🔍 BankAccountDialog: Sending account data:', {
      name: accountName,
      type: accountType,
      bankName,
      accountName,
      balance: 0,
      currency: 'TRY',
      hasCheckingAccount,
      hasCreditCard,
      hasLoan,
      hasOverdraft,
      hasSavings,
    });

    onAddBankAccount({
      name: accountName, // Backend schema'sında 'name' field'ı required
      type: accountType,
      bankName,
      accountName,
      balance: 0, // Default balance for new accounts
      currency: 'TRY',
      hasCheckingAccount,
      hasCreditCard,
      hasLoan,
      hasOverdraft,
      hasSavings,
      // Credit card details
      creditCardCutOffDate: hasCreditCard ? creditCardCutOffDate : null,
      creditCardDueDate: hasCreditCard ? creditCardDueDate : null,
      creditCardGracePeriod: hasCreditCard ? creditCardGracePeriod : null,
      creditCardMinimumPayment: hasCreditCard ? creditCardMinimumPayment : null,
      creditCardInterestRate: hasCreditCard ? creditCardInterestRate : null,
      // Loan details
      loanDueDate: hasLoan ? loanDueDate : null,
      loanGracePeriod: hasLoan ? loanGracePeriod : null,
      loanMinimumPayment: hasLoan ? loanMinimumPayment : null,
      loanInterestRate: hasLoan ? loanInterestRate : null,
      // Overdraft details
      overdraftLimit: hasOverdraft ? overdraftLimit : null,
      overdraftInterestRate: hasOverdraft ? overdraftInterestRate : null,
    });

    // Reset form
    setBankName('');
    setAccountName('');
    setAccountType('personal');
    setHasCheckingAccount(true); // Reset'te de Vadesiz Hesap seçili kalsın
    setHasCreditCard(false);
    setHasLoan(false);
    setHasOverdraft(false);
    setHasSavings(false);
    setCreditCardCutOffDate('');
    setCreditCardDueDate('');
    setCreditCardGracePeriod('');
    setCreditCardMinimumPayment('');
    setCreditCardInterestRate('');
    setLoanDueDate('');
    setLoanGracePeriod('');
    setLoanMinimumPayment('');
    setLoanInterestRate('');
    setOverdraftLimit('');
    setOverdraftInterestRate('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        data-testid="dialog-add-bank-account"
      >
        <DialogHeader>
          <DialogTitle data-testid="dialog-title">
            Yeni Banka Hesabı Ekle
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Type - Sadece allowTypeChange true ise göster */}
          {allowTypeChange && (
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">
                Hesap Türü
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={accountType === 'personal' ? 'default' : 'outline'}
                  className="justify-start"
                  onClick={() => setAccountType('personal')}
                  data-testid="button-account-type-personal"
                >
                  <User className="w-4 h-4 mr-2" />
                  Kişisel
                </Button>
                <Button
                  type="button"
                  variant={accountType === 'company' ? 'default' : 'outline'}
                  className="justify-start"
                  onClick={() => setAccountType('company')}
                  data-testid="button-account-type-company"
                >
                  <Building className="w-4 h-4 mr-2" />
                  Şirket
                </Button>
              </div>
            </div>
          )}

          {/* Hesap Türü Bilgisi - allowTypeChange false ise göster */}
          {!allowTypeChange && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                {accountType === 'company' ? (
                  <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                ) : (
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                )}
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {accountType === 'company'
                    ? 'Şirket Hesabı'
                    : 'Kişisel Hesap'}{' '}
                  ekleniyor
                </span>
              </div>
            </div>
          )}

          {/* Bank Name */}
          <div>
            <Label
              htmlFor="bankName"
              className="text-sm font-medium text-foreground mb-2 block"
            >
              Banka Adı
            </Label>
            <Input
              id="bankName"
              placeholder="Örn: Yapı Kredi, Garanti, İş Bankası"
              value={bankName}
              onChange={e => setBankName(e.target.value)}
              required
              data-testid="input-bank-name"
            />
          </div>

          {/* Account Name */}
          <div>
            <Label
              htmlFor="accountName"
              className="text-sm font-medium text-foreground mb-2 block"
            >
              Hesap Adı
            </Label>
            <Input
              id="accountName"
              placeholder={`${accountType === 'company' ? 'Şirket' : 'Kişisel'} hesap açıklaması`}
              value={accountName}
              onChange={e => setAccountName(e.target.value)}
              required
              data-testid="input-account-name"
            />
          </div>

          {/* Bank Products Selection */}
          <Card className="bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-4">
                <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Banka Ürünleri
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="checking"
                    checked={hasCheckingAccount}
                    onCheckedChange={checked =>
                      setHasCheckingAccount(!!checked)
                    }
                  />
                  <Label htmlFor="checking" className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Vadesiz Hesap
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="creditCard"
                    checked={hasCreditCard}
                    onCheckedChange={checked => setHasCreditCard(!!checked)}
                  />
                  <Label
                    htmlFor="creditCard"
                    className="flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    Kredi Kartı
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="loan"
                    checked={hasLoan}
                    onCheckedChange={checked => setHasLoan(!!checked)}
                  />
                  <Label htmlFor="loan" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Kredi
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="overdraft"
                    checked={hasOverdraft}
                    onCheckedChange={checked => setHasOverdraft(!!checked)}
                  />
                  <Label
                    htmlFor="overdraft"
                    className="flex items-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    KMH (Kredi Mevduat Hesabı)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="savings"
                    checked={hasSavings}
                    onCheckedChange={checked => setHasSavings(!!checked)}
                  />
                  <Label htmlFor="savings" className="flex items-center gap-2">
                    <PiggyBank className="w-4 h-4" />
                    Vadeli Hesap
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credit Card Details */}
          {hasCreditCard && (
            <Card className="bg-green-50/50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Kredi Kartı Detayları
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label
                      htmlFor="ccCutOffDate"
                      className="text-xs text-green-600 dark:text-green-400"
                    >
                      Kesim Tarihi (Ayın Kaçı)
                    </Label>
                    <Select
                      value={creditCardCutOffDate}
                      onValueChange={setCreditCardCutOffDate}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Gün" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {(i + 1).toString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label
                      htmlFor="ccDueDate"
                      className="text-xs text-green-600 dark:text-green-400"
                    >
                      Son Ödeme (Ayın Kaçı)
                    </Label>
                    <Select
                      value={creditCardDueDate}
                      onValueChange={setCreditCardDueDate}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Gün" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {(i + 1).toString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div>
                    <Label
                      htmlFor="ccGracePeriod"
                      className="text-xs text-green-600 dark:text-green-400"
                    >
                      Erteleme (Gün)
                    </Label>
                    <Input
                      id="ccGracePeriod"
                      type="number"
                      placeholder="0"
                      value={creditCardGracePeriod}
                      onChange={e => setCreditCardGracePeriod(e.target.value)}
                      className="h-8"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="ccMinPayment"
                      className="text-xs text-green-600 dark:text-green-400"
                    >
                      Asgari Ödeme (TL)
                    </Label>
                    <Input
                      id="ccMinPayment"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={creditCardMinimumPayment}
                      onChange={e =>
                        setCreditCardMinimumPayment(e.target.value)
                      }
                      className="h-8"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="ccInterestRate"
                      className="text-xs text-green-600 dark:text-green-400"
                    >
                      Faiz Oranı (%)
                    </Label>
                    <Input
                      id="ccInterestRate"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={creditCardInterestRate}
                      onChange={e => setCreditCardInterestRate(e.target.value)}
                      className="h-8"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loan Details */}
          {hasLoan && (
            <Card className="bg-orange-50/50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    Kredi Detayları
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label
                      htmlFor="loanDueDate"
                      className="text-xs text-orange-600 dark:text-orange-400"
                    >
                      Ödeme Tarihi (Ayın Kaçı)
                    </Label>
                    <Select value={loanDueDate} onValueChange={setLoanDueDate}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Gün" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {(i + 1).toString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label
                      htmlFor="loanGracePeriod"
                      className="text-xs text-orange-600 dark:text-orange-400"
                    >
                      Erteleme (Gün)
                    </Label>
                    <Input
                      id="loanGracePeriod"
                      type="number"
                      placeholder="0"
                      value={loanGracePeriod}
                      onChange={e => setLoanGracePeriod(e.target.value)}
                      className="h-8"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <Label
                      htmlFor="loanMinPayment"
                      className="text-xs text-orange-600 dark:text-orange-400"
                    >
                      Aylık Taksit (TL)
                    </Label>
                    <Input
                      id="loanMinPayment"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={loanMinimumPayment}
                      onChange={e => setLoanMinimumPayment(e.target.value)}
                      className="h-8"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="loanInterestRate"
                      className="text-xs text-orange-600 dark:text-orange-400"
                    >
                      Faiz Oranı (%)
                    </Label>
                    <Input
                      id="loanInterestRate"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={loanInterestRate}
                      onChange={e => setLoanInterestRate(e.target.value)}
                      className="h-8"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Overdraft Details */}
          {hasOverdraft && (
            <Card className="bg-red-50/50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">
                    KMH Detayları
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label
                      htmlFor="overdraftLimit"
                      className="text-xs text-red-600 dark:text-red-400"
                    >
                      KMH Limiti (TL)
                    </Label>
                    <Input
                      id="overdraftLimit"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={overdraftLimit}
                      onChange={e => setOverdraftLimit(e.target.value)}
                      className="h-8"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="overdraftInterestRate"
                      className="text-xs text-red-600 dark:text-red-400"
                    >
                      Faiz Oranı (%)
                    </Label>
                    <Input
                      id="overdraftInterestRate"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={overdraftInterestRate}
                      onChange={e => setOverdraftInterestRate(e.target.value)}
                      className="h-8"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={
                isLoading ||
                (!hasCheckingAccount &&
                  !hasCreditCard &&
                  !hasLoan &&
                  !hasOverdraft &&
                  !hasSavings)
              }
              data-testid="button-add-account"
            >
              {isLoading ? 'Ekleniyor...' : 'Banka Hesabı Ekle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
