const { useState, useEffect, useRef, useMemo } = React;

const FALLBACK_IMAGE = "https://via.placeholder.com/200x280?text=No+Image";

/* Login Page Component */
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username) {
      setError("Please enter a username");
      return;
    }
    // Dummy login: mark as admin if username is "admin"
    onLogin(username);
  };

  return (
  <div className="login-bg">
    <div className="login-page">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={e => { setUsername(e.target.value); setError(""); }}
          />
        </label>

        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit">Log In</button>
      </form>
    </div>
  </div>
);
}

/* Navigation Bar */
function NavBar({ user, onLogout, onCart }) {
  return (
    <div className="navbar">
      <h1>Getbooks</h1>
      <div className="navbar-right">
        {user && <span>Welcome, {user.name} {user.isAdmin && "(Admin)"}</span>}
        {user && !user.isAdmin && <button type="button" onClick={onCart}>View Cart</button>}
        {user && <button type="button" onClick={onLogout}>Logout</button>}
      </div>
    </div>
  );
}

/* Book List (grid of book cards) */
function BookList({ books, onAddToCart, onDelete, isAdmin }) {
  return (
    <div className="container">
      {books.map((book) => (
        <div className="book-container" key={book.title}>
          <img
            src={book.img || FALLBACK_IMAGE}
            alt={book.title}
            className="book-img"
            onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
            loading="lazy"
          />
          <h2>{book.title}</h2>
          <h4>{book.author}</h4>
          <p>{book.desc}</p>
          {isAdmin ? (
            <button className="delete-btn" type="button" onClick={() => onDelete(book)}>Delete</button>
          ) : (
            <button className="buy-btn" type="button" onClick={() => onAddToCart(book)}>Add To Cart</button>
          )}
          <p className="book-price">Price: ₹{book.price}</p>
        </div>
      ))}
    </div>
  );
}

/* Admin Panel for adding books */
function AdminPanel({ onAddBook }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [imgUrl, setImgUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const sanitizedTitle = title.trim();
    const sanitizedAuthor = author.trim();
    const sanitizedDesc = desc.trim();
    const sanitizedImgUrl = imgUrl.trim();
    const parsedPrice = parseInt(price, 10);
    if (sanitizedTitle && sanitizedAuthor && sanitizedDesc && price !== "" && sanitizedImgUrl && Number.isFinite(parsedPrice)) {
      onAddBook({ title: sanitizedTitle, author: sanitizedAuthor, desc: sanitizedDesc, price: parsedPrice, img: sanitizedImgUrl });
      // Clear form
      setTitle(""); setAuthor(""); setDesc(""); setPrice(""); setImgUrl("");
    } else {
      alert('Please fill all fields and provide a valid numeric price.');
    }
  };

  return (
    <div className="admin-panel">
      <h2>Admin Panel - Add New Book</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Title" value={title}
               onChange={e => setTitle(e.target.value)} required />
        <input type="text" placeholder="Author" value={author}
               onChange={e => setAuthor(e.target.value)} required />
        <textarea placeholder="Description" value={desc}
                  onChange={e => setDesc(e.target.value)} required></textarea>
        <input type="number" placeholder="Price (₹)" value={price}
               onChange={e => setPrice(e.target.value)} required />
        <input type="text" placeholder="Cover Image URL" value={imgUrl}
               onChange={e => setImgUrl(e.target.value)} required />
        <button type="submit">Add Book</button>
      </form>
    </div>
  );
}

/* Shopping Cart Modal */
function CartModal({ cart, onClose, onCheckout, setCart }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const updateQty = (book, delta) => {
    setCart(prev => prev.map(item => {
      if (item.title === book.title) {
        const newQty = item.qty + delta;
        return { ...item, qty: newQty > 0 ? newQty : 1 };
      }
      return item;
    }));
  };

  const removeItem = (book) => {
    setCart(prev => prev.filter(item => item.title !== book.title));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Shopping Cart</h2>
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>Your cart is empty.</p>
            <p>Start browsing our collection to add some books!</p>
            <button type="button" onClick={onClose} style={{ marginTop: '10px' }}>Continue Shopping</button>
          </div>
        ) : (
          cart.map((item, idx) => (
            <div key={idx} className="cart-item">
              <img
                src={item.img || FALLBACK_IMAGE}
                alt={item.title}
                onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
              />
              <div className="cart-info">
                <p><strong>{item.title}</strong></p>
                <p>Author: {item.author}</p>
                <p>Price: ₹{item.price}</p>
                <p>
                  Qty:
                        <button type="button" onClick={() => updateQty(item, -1)}>-</button>
                        {item.qty}
                        <button type="button" onClick={() => updateQty(item, 1)}>+</button>
                        <button type="button" onClick={() => removeItem(item)}>Remove</button>
                </p>
              </div>
            </div>
          ))
        )}
        <hr/>
        <p><strong>Total: ₹{total}</strong></p>
              <button type="button" onClick={onCheckout} disabled={cart.length===0}>Proceed to Checkout</button>
              <button type="button" onClick={onClose}>Continue Shopping</button>
      </div>
    </div>
  );
}

/* Checkout Page */
function CheckoutPage({ cart, onComplete, onCancel }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const sanitizedName = name.trim();
    const sanitizedAddress = address.trim();
    if (sanitizedName && sanitizedAddress) {
      setSubmitted(true);
      onComplete();  // Clear cart in parent
    } else {
      alert('Please fill in all fields.');
    }
  };

  if (submitted) {
    return (
      <div className="checkout-page">
        <h2>Thank you {name || 'Customer'}! Your order has been placed.</h2>
        <p>Order Total: ₹{total}</p>
        <p>A confirmation email will be sent soon.</p>
        <button type="button" onClick={onCancel}>Back to Store</button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Your Name" value={name}
               onChange={e => setName(e.target.value)} required/>
        <input type="text" placeholder="Shipping Address" value={address}
               onChange={e => setAddress(e.target.value)} required/>
        <p><strong>Order Total: ₹{total}</strong></p>
        <button type="submit">Confirm Order</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </form>
    </div>
  );
}

/* Main App Component */

function CategoryCarousel({ categoryKey, data, onAddToCart }) {
  const CLONE_COUNT = Math.min(4, data.books.length);
  const trackRef = React.useRef(null);
  const positionRef = React.useRef(CLONE_COUNT);

  if (!Array.isArray(data.books) || data.books.length === 0) return null;

  // Single book – no carousel
  if (data.books.length === 1) {
    const b = data.books[0];
    return (
      <div className="single-book">
        <img src={b.image || FALLBACK_IMAGE} alt={b.title} />
        <h4>{b.title}</h4>
        <p>by {b.author}</p>
        <p className="price">₹{b.price}</p>
        <button onClick={() => onAddToCart(b)}>Add to Cart</button>
      </div>
    );
  }

  React.useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const card = track.querySelector(".book");
    if (!card) return;

    const cardWidth = card.offsetWidth + 20;
    positionRef.current = CLONE_COUNT;

    track.style.transition = "none";
    track.style.transform = `translateX(-${CLONE_COUNT * cardWidth}px)`;
  }, [data.books]);

    const move = (dir) => {
    const track = trackRef.current;
    const card = track.querySelector(".book");
    if (!card) return;

    const cardWidth = card.offsetWidth + 20;
    const total = data.books.length;

    positionRef.current += dir;
    track.style.transition = "transform 0.4s ease";
    track.style.transform = `translateX(-${positionRef.current * cardWidth}px)`;

    const onEnd = () => {
      if (positionRef.current >= total + CLONE_COUNT) {
        track.style.transition = "none";
        positionRef.current = CLONE_COUNT;
        track.style.transform = `translateX(-${positionRef.current * cardWidth}px)`;
      }
      if (positionRef.current < CLONE_COUNT) {
        track.style.transition = "none";
        positionRef.current = total + CLONE_COUNT - 1;
        track.style.transform = `translateX(-${positionRef.current * cardWidth}px)`;
      }
      track.removeEventListener("transitionend", onEnd);
    };

    track.addEventListener("transitionend", onEnd);
  };

  // build clones + real items
  const books = data.books;
  const allBooks = [
    ...books.slice(-CLONE_COUNT),
    ...books,
    ...books.slice(0, CLONE_COUNT)
  ];

  return (
    <div className="carousel-wrapper">
      <button className="carousel-btn left" onClick={() => move(-1)}>❮</button>

      <div className="book-row">
        <div className="book-track" ref={trackRef}>
          {allBooks.map((b, i) => (
            <div className="book" key={`${categoryKey}-${i}`}>
              <img src={b.image || FALLBACK_IMAGE} alt={b.title} />
              <h4>{b.title}</h4>
              <p>by {b.author}</p>
              <p className="price">₹{b.price}</p>
              <button onClick={() => onAddToCart(b)}>Add to Cart</button>
            </div>
          ))}
        </div>
      </div>

      <button className="carousel-btn right" onClick={() => move(1)}>❯</button>
    </div>
  );
}


// Icon mapping for categories
const categoryIcons = {
  history: 'fa-columns',
  entertainment: 'fa-microphone',
  fiction: 'fa-pen',
  fantasy: 'fa-wand-magic-sparkles',
  science: 'fa-microscope',
  biography: 'fa-book',
  children: 'fa-cube',
  'self-help': 'fa-book-reader'
};

function Categories({ onAddToCart }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = (key) => {
    setLoading(true);
    setSelected(key);
    // Simulate loading time
    setTimeout(() => setLoading(false), 500);
  };

  if (!selected) {
    return (
      <section className="categories-section">
        <h2 className="section-title">Categories</h2>
        <div className="categories-grid">
          {Object.keys(booksData).map(key => (
            <div key={key} className={`category-card ${key.replace(/\s+/g, '')}`} onClick={() => handleSelect(key)}>
              <div className="category-icon">
                <i className={`fas ${categoryIcons[key] || 'fa-book'}`}></i>
              </div>
              <h3>{booksData[key].title.replace(' Books','')}</h3>
              <p>Explore {booksData[key].title.toLowerCase()}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="categories-section">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Loading category...</p>
        </div>
      </section>
    );
  }

  // when a category is selected, show carousels ordered with selected first
  const ordered = [selected, ...Object.keys(booksData).filter(k => k !== selected)];

  return (
    <section className="categories-section">
      <button type="button" className="back-btn" onClick={() => setSelected(null)}>← Back to Categories</button>
      {ordered.map((key, idx) => (
        <div key={key} style={{ marginBottom: 30 }}>
          <h3 className="category-title">{booksData[key].title}</h3>
          <CategoryCarousel categoryKey={key} data={booksData[key]} onAddToCart={onAddToCart} />
        </div>
      ))}
    </section>
  );
}

function Highlights({ featuredBooks = [], onAddToCart }) {

  const categoryBooks = Object.values(booksData || {})
    .flatMap(cat => cat.books || []);

  const bestSellers = featuredBooks.slice(0, 4);
  const specialOffers = categoryBooks.slice(0, 4);

  const normalizeBook = (book) => ({
    title: book.title,
    author: book.author,
    desc: book.desc || "",
    price: book.price,
    img: book.img || book.image || FALLBACK_IMAGE
  });

  return (
    <section className="info-section highlight">
      <h2>Highlights</h2>

      {/* Best Sellers */}
      <div style={{ marginTop: "25px" }}>
        <h3 style={{ color: "#fd6569" }}>⭐ Best Sellers</h3>

        <div className="container">
          {bestSellers.map((book, i) => {
            const b = normalizeBook(book);

            return (
              <div className="book-container" key={i}>
                <img
                  src={b.img}
                  alt={b.title}
                  className="book-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_IMAGE;
                  }}
                />

                <h2>{b.title}</h2>
                <h4>{b.author}</h4>

                {b.desc && <p>{b.desc}</p>}

                <button
                  className="buy-btn"
                  type="button"
                  onClick={() => onAddToCart(b)}
                >
                  Add To Cart
                </button>

                <p className="book-price">₹{b.price}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Special Offers */}
      <div style={{ marginTop: "40px" }}>
        <h3 style={{ color: "#fd6569" }}>🏷 Special Offers</h3>

        <div className="container">
          {specialOffers.map((book, i) => {
            const b = normalizeBook(book);
            const discounted = Math.floor(b.price * 0.8);

            return (
              <div className="book-container" key={i}>
                <img
                  src={b.img}
                  alt={b.title}
                  className="book-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_IMAGE;
                  }}
                />

                <h2>{b.title}</h2>
                <h4>{b.author}</h4>

                <button
                  className="buy-btn"
                  type="button"
                  onClick={() => onAddToCart({ ...b, price: discounted })}
                >
                  Add To Cart
                </button>

                <p className="book-price">
                  ₹{discounted}
                  <span style={{
                    textDecoration: "line-through",
                    fontSize: "0.9rem",
                    color: "#999",
                    marginLeft: "8px"
                  }}>
                    ₹{b.price}
                  </span>
                </p>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}


const About = () => (
  <section className="about-section">
    <div className="about-container">
      <div className="about-text">
        <h2><i className="fas fa-book about-icon book-icon"></i> About GetBooks</h2>
        <p>
          <strong>GetBooks</strong> is your one-stop online destination for discovering,
          exploring, and purchasing <i className="fas fa-shopping-cart about-icon cart-icon"></i> books across every genre imaginable.
          From timeless classics and best-selling fiction to inspiring biographies,
          science, fantasy, and children’s books — we bring stories closer to you.
        </p>

        <p>
          Our mission is simple: to make reading accessible, affordable,
          and enjoyable for everyone. Whether you are a casual reader,
          a student, or a passionate book lover, GetBooks is designed
          to help you find the perfect book in just a few clicks.
        </p>

        <p>
          With secure checkout, curated collections, and fast delivery <i className="fas fa-truck about-icon truck-icon"></i>,
          we ensure a smooth and delightful shopping experience.
          At GetBooks, every book opens a new world — and we’re excited
          to be part of your reading journey.
        </p>
      </div>

      <div className="about-stats">
        <div className="stat-card">
          <h3>10,000+</h3>
          <p>Books Available</p>
        </div>
        <div className="stat-card">
          <h3>20+</h3>
          <p>Categories</p>
        </div>
        <div className="stat-card">
          <h3>50,000+</h3>
          <p> Happy Readers</p>
        </div>
      </div>
    </div>
  </section>
);

const Contact = () => {
    const [form, setForm] = React.useState({
    name: "",
    email: "",
    message: ""
  });
  const [submitted, setSubmitted] = React.useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    // Clear form
    setForm({ name: "", email: "", message: "" });

    // Hide success message after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  return (
    <section className="contact-section">
      <div className="contact-container">
        
        {/* LEFT SIDE */}
        <div className="contact-info">
          <h2>Contact Us</h2>
          <p>
            Have questions, feedback, or need help with an order?
            Our team is always happy to help you.
          </p>

          <div className="contact-details">
            <p><strong>Email:</strong> support@getbooks.com</p>
            <p><strong>Phone:</strong> +91 98765 XXXXX</p>
            <p><strong>Address:</strong> GetBooks HQ, Tamil Nadu, India</p>
            <p><strong>Hours:</strong> Mon – Sat, 9:00 AM – 7:00 PM</p>
          </div>

          {/* SOCIAL MEDIA */}
          <div className="social-section">
            <h4>Follow Us</h4>
            <div className="social-icons">
              <a href="#" aria-label="Instagram" className="instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" aria-label="Twitter" className="twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" aria-label="YouTube" className="youtube">
                <i className="fab fa-youtube"></i>
              </a>
              <a href="#" aria-label="Facebook" className="facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="contact-form">
          <h3>Send us a message</h3>

          {submitted && (
            <p className="success-msg">
              Thank you! Your message has been sent.
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <textarea
              name="message"
              placeholder="Your Message"
              rows="5"
              value={form.message}
              onChange={handleChange}
              required
            ></textarea>

            <button type="submit">Send Message</button>
          </form>
        </div>

      </div>
    </section>

  );
};


const Footer = () => (
  <footer className="footer">
    <p>© 2026 GetBooks. All Rights Reserved.</p>
  </footer>
);

const booksData = {
  history: {
    title: "History Books",
    books: [
      { title: "World History", author: "J. Smith", price: 550, image: "images/history/world-history.jpg" },
      { title: "Ancient Civilizations", author: "R. Brown", price: 380, image: "images/history/ancient-civilizations.jpg" },
      { title: "Modern History", author: "L. Davis", price: 400, image: "images/history/modern-history.jpg" },
      { title: "Indian History", author: "S. Kumar", price: 320, image: "images/history/indian-history.jpg" },
      { title: "World Wars", author: "T. Anderson", price: 460, image: "images/history/world-wars.jpg" },
      { title: "Medieval Times", author: "E. Wilson", price: 340, image: "images/history/medieval-times.jpg" },
      { title: "Renaissance Era", author: "M. Garcia", price: 900, image: "images/history/renaissance-era.jpg" },
      { title: "American History", author: "D. Martinez", price: 749, image: "images/history/american-history.jpg" },
      { title: "European History", author: "A. Johnson", price: 360, image: "images/history/european-history.jpg" },
      { title: "Great Leaders", author: "C. Thompson", price: 450, image: "images/history/great-leaders.jpg" }
    ]
  },
  entertainment: {
    title: "Entertainment Books",
    books: [
      { title: "Music Legends", author: "J. Lee", price: 349, image: "images/entertainment/music-legends.jpg" },
      { title: "Comedy World", author: "R. Wilson", price: 420, image: "images/entertainment/comedy-world.jpg" },
      { title: "Film Making", author: "L. Taylor", price: 1500, image: "images/entertainment/film-making.jpg" },
      { title: "Drama Tales", author: "S. Anderson", price: 170, image: "images/entertainment/drama-tales.jpg" },
      { title: "TV Industry", author: "T. Thomas", price: 140, image: "images/entertainment/tv-industry.jpg" },
      { title: "Dance Culture", author: "E. Jackson", price: 160, image: "images/entertainment/dance-culture.jpg" },
      { title: "Stage Shows", author: "M. White", price: 300, image: "images/entertainment/stage-shows.jpg" },
      { title: "Entertainment Biz", author: "D. Harris", price: 200, image: "images/entertainment/entertainment-biz.jpg" },
      { title: "Pop Culture", author: "A. Martin", price: 200, image: "images/entertainment/pop-culture.jpg" }
    ]
  },
  fiction: {
    title: "Fiction Books",
    books: [
      { title: "The Great Adventure", author: "J. Smith", price: 180, image: "images/fiction/the-great-adventure.jpg" },
      { title: "Silent Night", author: "R. Woods", price: 240, image: "images/fiction/silent-night.jpg" },
      { title: "Dark Roads", author: "A. Snow", price: 260, image: "images/fiction/dark-roads.jpg" },
      { title: "Hidden Truth", author: "M. Blake", price: 350, image: "images/fiction/hidden-truth.jpg" },
      { title: "Broken Dreams", author: "K. Ray", price: 370, image: "images/fiction/broken-dreams.jpg" },
      { title: "Midnight Call", author: "D. Stone", price: 540, image:"images/fiction/midnight-call.jpg" },
      { title: "Last Hope", author:"s. park", price: 460, image: "images/fiction/Last-hope.jpg" },
      { title: "Unknown Path", author: "L. Gray", price: 426, image: "images/fiction/unknown-path.jpg" },
      { title: "Final Chapter", author: "E. Green", price: 700, image: "images/fiction/final-chapter.jpg" }

    ]
  },
  fantasy: {
    title: "Fantasy Books",
    books: [
      { title: "Dragon Realm", author: "G. Martin", price: 270, image: "images/fantasy/dragon-realm.jpg" },
      { title: "Magic World", author: "J. Rowling", price: 350, image: "images/fantasy/magic-world.jpg" },
      { title: "Lost Kingdom", author: "C. Tolkien", price: 230, image: "images/fantasy/lost-kingdom.jpg" },
      { title: "Enchanted Forest", author: "L. Frank", price: 420, image: "images/fantasy/enchanted-forest.jpg" },
      { title: "Dark Wizard", author: "S. King", price: 280, image: "images/fantasy/dark-wizard.jpg" },
      { title: "Shadow Lands", author: "R. Jordan", price: 340, image: "images/fantasy/shadow-land.jpg" },
      { title: "Fantasy War", author: "B. Sanderson", price: 280, image: "images/fantasy/fantasy-war.jpg" },
      { title: "Mystical Beasts", author: "L. Frank", price: 200, image: "images/fantasy/enchanted-forest.jpg" },
      { title: "Wizard School", author: "H. Potter", price: 260, image: "images/fantasy/wizard-school.jpg" }
    ]
  },
  science: {
    title: "Science Books",
    books: [
      { title: "Physics Fundamentals", author: "J. Einstein", price: 260, image: "images/science/Physics Fundamentals.jpg" },
      { title: "Chemistry Basics", author: "M. Curie", price: 180, image: "images/science/chemistry Basics.jpg" },
      { title: "Biology World", author: "C. Darwin", price: 220, image: "images/science/Biology world.jpg" },
      { title: "Space Exploration", author: "N. Copernicus", price: 250, image: "images/science/Space Exploration.jpg" },
      { title: "Earth Science", author: "I. Newton", price: 190, image: "images/science/Earth science.jpg" },
      { title: "Quantum Mechanics", author: "E. Schrödinger", price: 240, image: "images/science/Quantum Mechanics.jpg" },
      { title: "Climate Change", author: "G. Mendel", price: 210, image: "images/science/climate change.jpg" },
      { title: "Genetics Guide", author: "S. Hawking", price: 230, image: "images/science/Genetics Guide.jpg" },
      { title: "Scientific Method", author: "F. Bacon", price: 170, image: "images/science/Scientific Method.jpg" }
    ]
  },
  biography: {
    title: "Biography Books",
    books: [
      { title: "Steve Jobs Story", author: "W. Isaacson", price: 180, image: "images/biography/Steve Jobs Story.jpg" },
      { title: "Malala Yousafzai Life", author: "M. Yousafzai", price: 500, image: "images/biography/Malala Yousafzai Life.jpg" },
      { title: "Elon Musk Biography", author: "A. Vance", price: 250, image: "images/biography/Elon Musk Biography.jpg" },
      { title: "Oprah Winfrey Storytelling", author: "O. Winfrey", price: 400, image: "images/biography/Oprah Winfrey Storytelling.jpg" },
      { title: "Nelson Mandela Memoirs", author: "N. Mandela", price: 390, image: "images/biography/Nelson Mandela Memoirs.jpg" },
      { title: "Barack Obama Storytelling", author: "B. Obama", price: 250, image: "images/biography/Barack Obama Storytelling.jpg" },
      { title: "Mary Curie Life", author: "M. Curie", price: 370, image: "images/biography/Mary Curie Legacy.jpg" },
      { title: "Mother Teresa Story", author: "M. Teresa", price: 160, image: "images/biography/Mother Teresa Biography.jpg" }
    ]
  },
  children: {
    title: "Children Books",
    books: [
      { title: "The Cat in the Hat", author: "Dr. Seuss", price: 300, image: "images/children/the-cat-in-the-hat.jfif" },
      { title: "Where the Wild Things Are", author: "Maurice Sendak", price: 120, image: "images/children/where-the-wild-things-are.jfif" },
      { title: "The Little Red Hen", author: "E. B. White", price: 150, image: "images/children/the-little-red-hen.jfif" },
      { title: "Dear Zoo", author: "Roald Dahl", price: 140, image: "images/children/dear-zoo.jfif" },
      { title: "The Tale of Peter Rabbit", author: "Beatrix Potter", price: 280, image: "images/children/the-tale-of-peter-rabbit.jfif" },
      { title: "Goodnight Moon", author: "Margaret Wise Brown", price: 450, image: "images/children/goodnight-moon.jfif" },
      { title: "Green Eggs and Ham", author: "Dr. Seuss", price: 430, image: "images/children/green-eggs-and-ham.jfif" },
      { title: "The Very Hungry Caterpillar", author: "Eric Carle", price: 360, image: "images/children/the-very-hungry-caterpillar.jfif" },
      { title: "Brown Bear, Brown Bear, What Do You See?", author: "Bill Martin Jr.", price: 520, image: "images/children/brown-bear-brown-bear.jfif" }
    ]
  },
  "self-help": {
    title: "Self-Help Books",
    books: [
      { title: "How to Win Friends and Influence People", author: "Dale Carnegie", price: 370, image: "images/self-help/how-to-win-friends.jfif" },
      { title: "The Power of Positive Thinking", author: "Norman Vincent Peale", price: 550, image: "images/self-help/the-power-of-positive-thinking.jfif" },
      { title: "Atomic Habits", author: "James Clear", price: 250, image: "images/self-help/atomic-habits.jfif" },
      { title: "The 7 Habits of Highly Effective People", author: "Stephen R. Covey", price: 290, image: "images/self-help/7-habits-of-highly-effective-people.jfif" },
      { title: "Think and Grow Rich", author: "Napoleon Hill", price: 400, image: "images/self-help/think-and-grow-rich.jfif" },
      { title: "Daring Greatly", author: "Mark Manson", price: 319, image: "images/self-help/daring-greatly.jfif" },
      { title: "The Four Agreements", author: "Paulo Coelho", price: 416, image: "images/self-help/the-four-agreements.jfif" },
    ]
  }
};


function App() {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([
    { title: "To Kill a Mockingbird", author: "Harper Lee", desc: "A gripping tale of prejudice.", price: 370, img: "https://covers.openlibrary.org/b/id/8228691-L.jpg" },
    { title: "Don Quixote", author: "Miguel de Cervantes", desc: "The timeless tale of adventure.", price: 449, img: "https://covers.openlibrary.org/b/id/11153223-L.jpg" },
    { title: "Harry Potter Series", author: "J. K. Rowling", desc: "Magical journey of friendship.", price: 330, img: "https://covers.openlibrary.org/b/id/10521213-L.jpg" },
    { title: "Game of Thrones Series", author: "George R. R. Martin", desc: "Epic saga of power and war.", price: 199, img: "https://covers.openlibrary.org/b/id/8312161-L.jpg" },
    { title: "Hitchhiker's Guide to the Galaxy", author: "Douglas Adams", desc: "Hilarious adventure through space.", price: 449, img: "https://covers.openlibrary.org/b/id/7222246-L.jpg" },
    { title: "1984", author: "George Orwell", desc: "Dystopian masterpiece.", price: 200, img: "https://covers.openlibrary.org/b/id/8101346-L.jpg" },
    { title: "Pride and Prejudice", author: "Jane Austen", desc: "Classic tale of love and misunderstanding.", price: 319, img: "https://covers.openlibrary.org/b/id/8226191-L.jpg" },
    { title: "The Little Prince", author: "Antoine de Saint-Exup\u00e9ry", desc: "Poetic journey of a young prince.", price: 349, img: "https://covers.openlibrary.org/b/id/8319256-L.jpg" }
  ]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [page, setPage] = useState('store'); // 'store' or 'checkout'
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Check localStorage for persisted user on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("user"));
      if (saved) setUser(saved);
    } catch (err) {
      console.warn('Could not parse saved user from localStorage', err);
    }
  }, []);

  // Handle login (called from LoginPage)
  const handleLogin = (username) => {
    try {
      const isAdmin = username.toLowerCase() === 'admin';
      const newUser = { name: username, isAdmin };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Failed to save user to localStorage:', error);
      // Optionally, show a user-friendly message or fallback
    }
  };
  /**
   * Logs out the current user by clearing state and localStorage.
   */
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  /**
   * Adds a book to the cart. If the book already exists, increments its quantity.
   * Also triggers a toast notification.
   * @param {Object} book - The book object to add, containing title, author, price, etc.
   */
  const addToCart = (book) => {
    setCart(prev => {
      const existing = prev.find(item => item.title === book.title);

      if (existing) {
        return prev.map(item =>
          item.title === book.title
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      return [...prev, { ...book, qty: 1 }];
    });
    setToastMessage(`${book.title} added to cart!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1700);
    setTimeout(() => setToastMessage(""), 2000);
  };
  /**
   * Deletes a book from the books list (admin only).
   * @param {Object} book - The book object to delete.
   */
  const handleDeleteBook = (book) => {
    setBooks(prev => prev.filter(item => item.title !== book.title));
  };

  // Filter and sort books based on query and sort selection
  const filteredBooks = useMemo(() => {
    let filtered = books.filter(book => {
      const q = query.toLowerCase();
      return book.title.toLowerCase().includes(q)
          || book.author.toLowerCase().includes(q)
          || book.desc.toLowerCase().includes(q);
    });
    if (sort === "az") {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "price") {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    }
    return filtered;
  }, [books, query, sort]);

  // If not logged in, show login page
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }
  // Checkout page
  if (page === 'checkout') {
    return (
      <div>
        <NavBar user={user} onLogout={handleLogout} />
        <CheckoutPage 
          cart={cart} 
          onComplete={() => setCart([])} 
          onCancel={() => setPage('store')} 
        />
      </div>
    );
  }

  // Main store page
  return (
    <div>
      <NavBar user={user} onLogout={handleLogout} onCart={() => setShowCart(true)} />
      {user.isAdmin && 
        <AdminPanel onAddBook={book => setBooks(prev => [...prev, book])} />
      }
      <div className="book-index-title"><h1>Featured Books</h1></div>
      <div className="search-bar-container">
        <input 
          type="text" 
          placeholder="Search books by title or author..." 
          value={query} 
          onChange={e => setQuery(e.target.value)} 
        />
      </div>
      
      <select className="sort-dropdown" value={sort} onChange={e => setSort(e.target.value)}>
        <option value="">Sort By</option>
        <option value="az">Title (A–Z)</option>
        <option value="price">Price (Low → High)</option>
      </select>

      <BookList 
        books={filteredBooks} 
        onAddToCart={addToCart} 
        onDelete={handleDeleteBook} 
        isAdmin={user.isAdmin} 
      />
      {showCart && 
        <CartModal 
          cart={cart} 
          onClose={() => setShowCart(false)} 
          onCheckout={() => { setPage('checkout'); setShowCart(false); }} 
          setCart={setCart} 
        />
      }
      <Categories onAddToCart={addToCart} />
      <Highlights featuredBooks={books} onAddToCart={addToCart} />
      <About />
      <Contact />
      <Footer />

      {toastMessage && (
        <div className={`toast ${showToast ? 'show' : ''}`}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Root element not found. Make sure your HTML has <div id='root'></div>");
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}

