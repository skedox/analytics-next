import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAnalytics, usePageview, useIdentity, TrackClick } from '@skedox/react';
import { useState } from 'react';

// Track pageviews on route change
function PageviewTracker() {
  const location = useLocation();
  usePageview(location.pathname);
  return null;
}

// Home page
function Home() {
  const { track } = useAnalytics();

  return (
    <div className="page">
      <h2>Home</h2>
      <p>Welcome to the Skedox Analytics React example.</p>

      <div className="buttons">
        <button
          className="btn btn-primary"
          onClick={() => track('cta_click', { location: 'home', variant: 'primary' })}
        >
          Track CTA Click
        </button>

        <TrackClick event="hero_button" data={{ section: 'hero' }}>
          <button className="btn btn-success">TrackClick Component</button>
        </TrackClick>
      </div>
    </div>
  );
}

// About page
function About() {
  const { track } = useAnalytics();

  return (
    <div className="page">
      <h2>About</h2>
      <p>Learn more about our analytics solution.</p>

      <div className="buttons">
        <button className="btn btn-primary" onClick={() => track('read_more', { page: 'about' })}>
          Track Read More
        </button>
      </div>
    </div>
  );
}

// Products page
function Products() {
  const { track } = useAnalytics();
  const products = [
    { id: 1, name: 'Widget Pro', price: 99 },
    { id: 2, name: 'Widget Plus', price: 149 },
    { id: 3, name: 'Widget Max', price: 199 },
  ];

  const handleAddToCart = (product: (typeof products)[0]) => {
    track('add_to_cart', {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
    });
  };

  return (
    <div className="page">
      <h2>Products</h2>
      <div className="products">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p className="price">${product.price}</p>
            <button className="btn btn-success" onClick={() => handleAddToCart(product)}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Contact page
function Contact() {
  const { track } = useAnalytics();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    track('form_submit', { form: 'contact', success: true });
    setSubmitted(true);
  };

  return (
    <div className="page">
      <h2>Contact</h2>
      {submitted ? (
        <p className="success">Thank you! Form submitted.</p>
      ) : (
        <form onSubmit={handleSubmit} className="form">
          <input type="text" placeholder="Name" required />
          <input type="email" placeholder="Email" required />
          <textarea placeholder="Message" required></textarea>
          <button type="submit" className="btn btn-primary">
            Submit (Track Form)
          </button>
        </form>
      )}
    </div>
  );
}

// Status panel
function StatusPanel() {
  const { visitorId, sessionId } = useIdentity();
  const { optOut, optIn } = useAnalytics();
  const [enabled, setEnabled] = useState(true);

  const handleOptOut = () => {
    optOut();
    setEnabled(false);
  };

  const handleOptIn = () => {
    optIn();
    setEnabled(true);
  };

  return (
    <div className="status-panel">
      <div className="status-item">
        <label>Status</label>
        <span className={`badge ${enabled ? 'badge-success' : 'badge-danger'}`}>
          {enabled ? 'Active' : 'Disabled'}
        </span>
      </div>
      <div className="status-item">
        <label>Visitor ID</label>
        <code>{visitorId || 'N/A'}</code>
      </div>
      <div className="status-item">
        <label>Session ID</label>
        <code>{sessionId || 'N/A'}</code>
      </div>
      <div className="status-actions">
        <button className="btn btn-sm btn-danger" onClick={handleOptOut}>
          Opt Out
        </button>
        <button className="btn btn-sm btn-success" onClick={handleOptIn}>
          Opt In
        </button>
      </div>
    </div>
  );
}

// Main App
export default function App() {
  return (
    <div className="app">
      <PageviewTracker />

      <header>
        <h1>Skedox Analytics - React</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/products">Products</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>

      <aside>
        <StatusPanel />
      </aside>

      <footer>
        <p>Open browser console to see tracking events (debug mode enabled)</p>
      </footer>
    </div>
  );
}
