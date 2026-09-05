import { CustomerDetails } from '../data';

interface CustomerFormProps {
  value: CustomerDetails;
  onChange: (customer: CustomerDetails) => void;
}

export default function CustomerForm({ value, onChange }: CustomerFormProps) {

  function update(field: keyof CustomerDetails, v: string) {
    onChange({ ...value, [field]: v });
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Customer details</h2>

      </div>

      <div className="form-grid">
        <label className="field">
          <span>Full name *</span>
          <input
            type="text"
            value={value.name}
            onChange={(e) => update('name', e.target.value)}
            //placeholder=""
            required
          />
        </label>

        <label className="field">
          <span>Company</span>
          <input
            type="text"
            value={value.company}
            onChange={(e) => update('company', e.target.value)}
            //placeholder=""
          />
        </label>

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={value.email}
            onChange={(e) => update('email', e.target.value)}
           // placeholder=""
           required
          />
        </label>

        <label className="field">
          <span>Phone</span>
          <input
            type="tel"
            value={value.phone}
            onChange={(e) => update('phone', e.target.value)}
            //placeholder=""
          />
        </label>

        <label className="field field-full">
          <span>Billing address</span>
          <textarea
            value={value.address}
            onChange={(e) => update('address', e.target.value)}
            //placeholder=""
            rows={2}
          />
        </label>
      </div>
    </section>
  );
}