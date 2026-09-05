import { useState } from 'react';
import SignaturePad from './components/SignaturePad';
import CustomerForm from './components/CustomerForm';
import ProductSelect from './components/ProductSelect';
import {
  CartItem,
  CustomerDetails,
  nextInvoiceNumber,
} from './data';
import { downloadInvoicePdf } from './generateInvoicePdf';

const emptyCustomer: CustomerDetails = {
  name: '',
  company: '',
  email: '',
  phone: '',
  address: '',
};

export default function App() {
  const [signature, setSignature] = useState<string | null>(null);
  const [customer, setCustomer] = useState<CustomerDetails>(emptyCustomer);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState('Payment due within 30 days. Thank you.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepHint, setStepHint] = useState(1);

  async function generateInvoice() {
    setError(null);

    if (!customer.name.trim()) {
      setError('Please enter the customer name.');
      setStepHint(2);
      return;
    }
    if (cart.length === 0) {
      setError('Please select at least one product.');
      setStepHint(3);
      return;
    }
    if (!signature) {
      setError('Please save your signature before generating the invoice.');
      setStepHint(1);
      return;
    }

    setLoading(true);
    try {
      const invoiceNumber = nextInvoiceNumber();
      downloadInvoicePdf({
        customer,
        items: cart,
        invoiceNumber,
        signatureDataUrl: signature,
        notes,
      });
    } catch (err) {
      console.error(err);
      setError('Could not generate the PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <div className="bg-wash" aria-hidden="true" />

      <header className="hero">
        <p className="brand">Vikas Pvt. Ldt.</p>
        <h1>Invoice Generator</h1>
        <p className="lede">
          Add a signature, enter the customer, pick products, and download a one-page PDF.
        </p>
      </header>

      <nav className="steps" aria-label="Workflow steps">
        <button
          type="button"
          className={stepHint === 1 ? 'step is-active' : 'step'}
          onClick={() => setStepHint(1)}
        >
          <span>1</span> Signature
        </button>
        <button
          type="button"
          className={stepHint === 2 ? 'step is-active' : 'step'}
          onClick={() => setStepHint(2)}
        >
          <span>2</span> Customer
        </button>
        <button
          type="button"
          className={stepHint === 3 ? 'step is-active' : 'step'}
          onClick={() => setStepHint(3)}
        >
          <span>3</span> Products
        </button>
        <button
          type="button"
          className={stepHint === 4 ? 'step is-active' : 'step'}
          onClick={() => setStepHint(4)}
        >
          <span>4</span> Generate
        </button>
      </nav>

      <main className="layout">
        <div className="col">
          {stepHint === 1 && <SignaturePad onSignatureChange={setSignature} />}
          {stepHint === 2 && (
            <CustomerForm value={customer} onChange={setCustomer} />
          )}
          {stepHint === 3 && <ProductSelect cart={cart} onChange={setCart} />}
          {stepHint === 4 && (
            <section className="panel">
              <div className="panel-head">
                <h2>Generate invoice</h2>
                <p>Review and download a signed one-page PDF.</p>
              </div>

              <div className="review-grid">
                <div>
                  <h3>Customer</h3>
                  <p>{customer.name || '—'}</p>
                  {customer.company && <p className="muted">{customer.company}</p>}
                </div>
                <div>
                  <h3>Items</h3>
                  <p>
                    {cart.length === 0
                      ? '—'
                      : cart.map((c) => `${c.name} ×${c.quantity}`).join(', ')}
                  </p>
                </div>
                <div>
                  <h3>Signature</h3>
                  {signature ? (
                    <img
                      src={signature}
                      alt="Signature preview"
                      className="signature-mini"
                    />
                  ) : (
                    <p className="muted">Not saved yet</p>
                  )}
                </div>
              </div>

              <label className="field field-full">
                <span>Invoice notes</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </label>

              {error && <p className="error-banner" role="alert">{error}</p>}

              <div className="btn-row generate-row">
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={generateInvoice}
                  disabled={loading}
                >
                  {loading ? 'Generating…' : 'Download PDF invoice'}
                </button>
              </div>
            </section>
          )}
        </div>

        <aside className="aside">
          <div className="status-card">
            <h3>Ready checklist</h3>
            <ul>
              <li className={signature ? 'done' : ''}>
                Signature {signature ? 'saved' : 'needed'}
              </li>
              <li className={customer.name.trim() ? 'done' : ''}>
                Customer {customer.name.trim() ? 'added' : 'needed'}
              </li>
              <li className={cart.length > 0 ? 'done' : ''}>
                Products {cart.length > 0 ? 'selected' : 'needed'}
              </li>
            </ul>
            <p className="aside-note">
              Your signature is stored in <strong>localStorage</strong> in this
              browser. It stays until you clear it here or clear site data /
              cookies for this origin.
            </p>
            {stepHint < 4 && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setStepHint((s) => Math.min(4, s + 1))}
              >
                Continue
              </button>
            )}
            {stepHint > 1 && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setStepHint((s) => Math.max(1, s - 1))}
              >
                Back
              </button>
            )}
          </div>
        </aside>
      </main>

      <footer className="footer">
        <span>Meridian Supply Co. · Demo invoice tool</span>
        <span>No account · No database · Local browser storage</span>
      </footer>
    </div>
  );
}
