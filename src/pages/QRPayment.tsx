import { useLocation, useNavigate } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, ScanLine, CheckCircle2, CreditCard } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useCartContext } from '@/integrations/sellqo/CartContext';

export default function QRPayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { clearCart } = useCartContext();

  // Persist state in ref so clearCart re-renders don't lose it
  const stateRef = useRef(location.state as {
    orderNumber?: string;
    total?: number;
    currency?: string;
    qrData?: { payload?: string; image_url?: string };
    bankDetails?: { account_holder?: string; iban?: string; bic?: string; reference?: string };
  } | null);

  useEffect(() => {
    if (location.state) stateRef.current = location.state;
  }, [location.state]);

  const s = stateRef.current;

  // No state → redirect to shop
  if (!s?.orderNumber) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Geen betalingsgegevens gevonden.</p>
            <Button onClick={() => navigate('/shop')}>Naar de shop</Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const amount = Number(s.total || 0).toFixed(2);
  const currency = s.currency || 'EUR';
  const qrPayload = s.qrData?.payload;
  const qrImageUrl = s.qrData?.image_url;
  const bank = s.bankDetails;

  const handleConfirm = () => {
    clearCart();
    navigate('/bedankt', {
      state: {
        paymentType: 'qr',
        orderNumber: s.orderNumber,
        total: s.total,
        currency,
      },
    });
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-lg mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Scan & betaal</h1>
            <p className="text-muted-foreground">
              Bestelling <span className="font-semibold text-foreground">{s.orderNumber}</span>
            </p>
            <p className="text-3xl font-bold text-primary">
              {currency === 'EUR' ? '€' : currency} {amount}
            </p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-border">
              {qrPayload ? (
                <QRCodeSVG
                  value={qrPayload}
                  size={280}
                  level="M"
                  includeMargin={false}
                />
              ) : qrImageUrl ? (
                <img
                  src={qrImageUrl}
                  alt="Betaal QR code"
                  className="w-[280px] h-[280px] object-contain"
                />
              ) : (
                <div className="w-[280px] h-[280px] flex items-center justify-center text-muted-foreground">
                  QR code niet beschikbaar
                </div>
              )}
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground text-center">Hoe betaal je?</h2>
            <div className="space-y-3">
              {[
                { icon: Smartphone, step: '1', text: 'Open je bankapp op je telefoon' },
                { icon: ScanLine, step: '2', text: 'Kies "QR code scannen" en scan de code' },
                { icon: CheckCircle2, step: '3', text: 'Controleer het bedrag en bevestig de betaling' },
              ].map(({ icon: Icon, step, text }) => (
                <div key={step} className="flex items-center gap-4 bg-muted/50 rounded-xl p-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Stap {step}</span>
                    <p className="text-sm font-medium text-foreground">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bank details fallback */}
          {bank && (bank.iban || bank.account_holder) && (
            <details className="group">
              <summary className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                <CreditCard className="w-4 h-4" />
                Liever handmatig overschrijven?
              </summary>
              <div className="mt-3 bg-muted/50 rounded-xl p-4 space-y-1 text-sm">
                {bank.account_holder && (
                  <p><span className="font-medium">Naam:</span> {bank.account_holder}</p>
                )}
                {bank.iban && (
                  <p><span className="font-medium">IBAN:</span> {bank.iban}</p>
                )}
                {bank.bic && (
                  <p><span className="font-medium">BIC:</span> {bank.bic}</p>
                )}
                <p><span className="font-medium">Bedrag:</span> €{amount}</p>
                <p><span className="font-medium">Mededeling:</span> {s.orderNumber}</p>
              </div>
            </details>
          )}

          {/* Confirm button */}
          <div className="pt-4">
            <Button
              onClick={handleConfirm}
              size="lg"
              className="w-full text-base font-semibold"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Ik heb betaald
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Je ontvangt een bevestiging per e-mail zodra we de betaling hebben ontvangen.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
