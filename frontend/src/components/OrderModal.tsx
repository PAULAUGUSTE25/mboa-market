import { useEffect, useState } from 'react';
import { X, MapPin, Truck, CreditCard, Smartphone, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { ordersApi } from '../api/orders.api';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: {
    id: string;
    title: string;
    price_per_unit: number;
    unit: string;
    quantity: number;
    region: string;
    locality?: string;
    seller_id: string;
  };
}

const OLIVE = '#3F441C';

// Distances approximatives entre régions (en km)
const REGION_DISTANCES: Record<string, number> = {
  'Centre': 0,
  'Littoral': 50,
  'Ouest': 120,
  'Nord-Ouest': 300,
  'Sud-Ouest': 350,
  'Nord': 800,
  'Adamaoua': 600,
  'Est': 700,
  'Sud': 250,
  'Extrême-Nord': 1000,
};

export default function OrderModal({ isOpen, onClose, listing }: OrderModalProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<'quantity' | 'location' | 'payment' | 'confirmation' | 'success'>('quantity');
  const [quantity, setQuantity] = useState<number>(1);
  const [location, setLocation] = useState('');
  const [selectedRegion, setSelectedRegion] = useState(listing.region);
  const [paymentMethod, setPaymentMethod] = useState<'mobile' | 'card' | 'cash'>('mobile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setStep('quantity');
    setQuantity(1);
    setLocation('');
    setSelectedRegion(listing.region);
    setPaymentMethod('mobile');
    setError('');
  }, [isOpen, listing.region]);

  if (!isOpen) return null;

  // Calculs
  const itemPrice = quantity * listing.price_per_unit;
  const distance = REGION_DISTANCES[selectedRegion] || 100;
  const deliveryPrice = Math.max(1000, Math.round(distance * 5)); // 5 FCFA par km, min 1000 FCFA
  const totalPrice = itemPrice + deliveryPrice;
  const estimatedDeliveryHours = Math.max(2, Math.round(distance / 50)); // 50 km/h moyen

  const handleNext = () => {
    if (step === 'quantity') setStep('location');
    else if (step === 'location') setStep('payment');
    else if (step === 'payment') setStep('confirmation');
  };

  const handleBack = () => {
    if (step === 'location') setStep('quantity');
    else if (step === 'payment') setStep('location');
    else if (step === 'confirmation') setStep('payment');
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await ordersApi.create({
        listing_id: listing.id,
        quantity: quantity,
        delivery_address: `${location}, ${selectedRegion}`,
      });
      setStep('success');
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de la commande');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between" style={{ backgroundColor: OLIVE }}>
          <h2 className="text-white font-bold text-lg">
            {step === 'quantity' && t('Commander', 'Order')}
            {step === 'location' && t('Livraison', 'Delivery')}
            {step === 'payment' && t('Paiement', 'Payment')}
            {step === 'confirmation' && t('Confirmation', 'Confirmation')}
            {step === 'success' && t('Commande validée', 'Order confirmed')}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center px-5 py-4 bg-gray-50">
          {['quantity', 'location', 'payment', 'confirmation'].map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step === s
                    ? 'bg-[#3F441C] text-white scale-110'
                    : 'bg-gray-200 text-gray-500'
                } ${i > 0 ? 'ml-2' : ''}`}
              >
                {i + 1}
              </div>
              {i < 3 && (
                <div className={`flex-1 h-1 mx-2 rounded-full ${step === s || ['quantity', 'location', 'payment', 'confirmation'].indexOf(step) > i ? 'bg-[#3F441C]' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {/* Étape 1: Quantité */}
          {step === 'quantity' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{listing.title}</h3>
                <p className="text-sm text-gray-600">
                  {listing.price_per_unit.toLocaleString()} FCFA / {listing.unit}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {t('Disponible', 'Available')}: {listing.quantity} {listing.unit}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('Quantité souhaitée', 'Quantity')}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xl"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max={listing.quantity}
                    className="flex-1 text-center text-lg font-bold border border-gray-200 rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-[#3F441C]/20"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(listing.quantity, quantity + 1))}
                    className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xl"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-[#3F441C]/5 rounded-xl p-4 border border-[#3F441C]/20">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">{t('Sous-total', 'Subtotal')}</span>
                  <span className="font-bold text-lg" style={{ color: OLIVE }}>
                    {itemPrice.toLocaleString()} FCFA
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Étape 2: Localisation */}
          {step === 'location' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('Région de livraison', 'Delivery Region')}
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3F441C]/20"
                >
                  {Object.keys(REGION_DISTANCES).map((region) => (
                    <option key={region} value={region}>
                      {region} ({REGION_DISTANCES[region]} km)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('Adresse précise', 'Exact Address')}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t('Quartier, rue, numéro...', 'Neighborhood, street, number...')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3F441C]/20"
                />
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold">{t('Distance estimée', 'Estimated distance')}</p>
                  <p>{distance} km depuis {listing.region}</p>
                </div>
              </div>
            </div>
          )}

          {/* Étape 3: Paiement */}
          {step === 'payment' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {t('Mode de paiement', 'Payment Method')}
                </label>
                <div className="space-y-3">
                  {[
                    { id: 'mobile', icon: Smartphone, label: 'Mobile Money (Orange/MTN)', desc: 'Paiement instantané' },
                    { id: 'card', icon: CreditCard, label: 'Carte bancaire', desc: 'Visa, Mastercard' },
                    { id: 'cash', icon: Truck, label: 'Paiement à la livraison', desc: 'Espèces ou mobile' },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                        paymentMethod === method.id
                          ? 'border-[#3F441C] bg-[#3F441C]/5'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${paymentMethod === method.id ? 'bg-[#3F441C] text-white' : 'bg-gray-100 text-gray-600'}`}>
                        <method.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-semibold ${paymentMethod === method.id ? 'text-[#3F441C]' : 'text-gray-900'}`}>
                          {method.label}
                        </p>
                        <p className="text-xs text-gray-500">{method.desc}</p>
                      </div>
                      {paymentMethod === method.id && (
                        <CheckCircle className="w-5 h-5 text-[#3F441C]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('Produits', 'Products')}</span>
                  <span className="font-medium">{itemPrice.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('Livraison', 'Delivery')}</span>
                  <span className="font-medium">{deliveryPrice.toLocaleString()} FCFA</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">{t('Total', 'Total')}</span>
                    <span className="font-bold text-xl" style={{ color: OLIVE }}>
                      {totalPrice.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Étape 4: Confirmation */}
          {step === 'confirmation' && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t('Commande prête !', 'Order ready!')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('Vérifiez les détails avant de confirmer', 'Review details before confirming')}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{listing.title}</span>
                  <span className="font-medium">x{quantity} {listing.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('Livraison vers', 'Delivery to')}</span>
                  <span className="font-medium">{selectedRegion}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('Mode de paiement', 'Payment')}</span>
                  <span className="font-medium">
                    {paymentMethod === 'mobile' && 'Mobile Money'}
                    {paymentMethod === 'card' && 'Carte'}
                    {paymentMethod === 'cash' && 'À la livraison'}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">{t('Total', 'Total')}</span>
                    <span className="font-bold text-xl" style={{ color: OLIVE }}>
                      {totalPrice.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#3F441C]/5 rounded-xl border border-[#3F441C]/20">
                <Clock className="w-5 h-5 text-[#3F441C] flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-[#3F441C]">{t('Temps de livraison estimé', 'Estimated delivery time')}</p>
                  <p className="text-gray-700">{estimatedDeliveryHours}h</p>
                </div>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t('Commande confirmée !', 'Order confirmed!')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('Votre paiement est validé.', 'Your payment has been validated.')}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('Produit', 'Product')}</span>
                  <span className="font-medium">{listing.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('Quantité', 'Quantity')}</span>
                  <span className="font-medium">{quantity} {listing.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('Total payé', 'Total paid')}</span>
                  <span className="font-bold" style={{ color: OLIVE }}>{totalPrice.toLocaleString()} FCFA</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[#3F441C]/5 rounded-xl border border-[#3F441C]/20">
                <Clock className="w-5 h-5 text-[#3F441C] flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-[#3F441C]">{t('Temps de livraison estimé', 'Estimated delivery time')}</p>
                  <p className="text-gray-700">{estimatedDeliveryHours}h</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3 bg-gray-50">
          {step !== 'quantity' && step !== 'success' && (
            <button
              onClick={handleBack}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
            >
              {t('Retour', 'Back')}
            </button>
          )}
          <button
            onClick={step === 'confirmation' ? handleConfirm : step === 'success' ? onClose : handleNext}
            disabled={(step === 'location' && !location.trim()) || isSubmitting}
            className="flex-1 px-4 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: OLIVE }}
          >
            {isSubmitting ? t('Traitement...', 'Processing...') : (
              <>
                {step === 'quantity' && t('Continuer', 'Continue')}
                {step === 'location' && t('Continuer', 'Continue')}
                {step === 'payment' && t('Continuer', 'Continue')}
                {step === 'confirmation' && t('Confirmer la commande', 'Confirm Order')}
                {step === 'success' && t('Fermer', 'Close')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
