import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { useState, useEffect } from "react";
import "../../styles/products.css";

function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthToken = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.token;
  };

  // ✅ Fetch products
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("http://localhost:8080/api/products", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [navigate]);

  // ✅ Filter products
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredProducts(
        products.filter(
          (p) =>
            p.cropType.toLowerCase().includes(q) ||
            p.soilType.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, products]);

  // ✅ Delete product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete product?")) return;

    try {
      const token = getAuthToken();
      const res = await fetch(
        `http://localhost:8080/api/products/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Delete failed");

      setProducts((prev) => prev.filter((p) => p.id !== id));
      alert("Product deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    }
  };

  // ✅ Download QR Code
  const downloadQRCode = (id) => {
    const canvas = document.getElementById(`qrcode-${id}`);
    if (!canvas) return;
    const url = canvas.toDataURL();
    const link = document.createElement("a");
    link.href = url;
    link.download = `product-${id}.png`;
    link.click();
  };

  return (
    <div className="products-container">
      <h1 className="page-title">Farm Products</h1>

      {/* Header */}
      <div className="page-header">
        <input
          className="search-input"
          placeholder="Search by crop or soil..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="header-buttons">
          <button className="add-btn" onClick={() => navigate("/add-product")}>
            + Add Product
          </button>
          <button className="logout-btn" onClick={() => navigate("/login")}>
            Logout
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="loading">⏳ Loading products...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <h2>No products found</h2>
          <button className="add-btn" onClick={() => navigate("/add-product")}>
            ➕ Add Product
          </button>
        </div>
      ) : (
        // ✅ GRID VIEW
        <div className="products-grid">
          {filteredProducts.map((prod) => (
            <div className="product-card" key={prod.id}>
              {/* Image */}
              <img
                src={prod.imageUrl || "/placeholder.png"}
                alt={prod.cropType}
                className="product-img"
                onError={(e) => (e.target.src = "/placeholder.png")}
              />

              <h3>{prod.cropType}</h3>

              <p>🌱<strong>Soil:</strong> {prod.soilType}</p>
              <p>🧪<strong>Pesticide:</strong> {prod.pesticides}</p>
              <p>📅<strong>Harvest:</strong> {prod.harvestDate}</p>

              <p className="location">
                📍 {prod.latitude}, {prod.longitude}
              </p>

              {/* QR */}
              <div className="qr-container">
                <QRCodeCanvas
                  id={`qrcode-${prod.id}`}
                  value={`http://localhost:3000/product/${prod.id}`}
                  size={90}
                />
                <small>ID: {prod.id}</small>
                <button
                  className="btn qr-btn"
                  onClick={() => downloadQRCode(prod.id)}
                >
                  ⬇️ QR
                </button>
              </div>

              {/* Actions */}
              <div className="actions">
                <button
                  className="btn edit-btn"
                  onClick={() => navigate(`/edit-product/${prod.id}`)}
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn delete-btn"
                  onClick={() => handleDeleteProduct(prod.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductsPage;








// import { data, useNavigate } from "react-router-dom";
// import { QRCodeCanvas } from "qrcode.react";
// import { useState, useEffect } from "react";
// import "../../styles/products.css";

// function ProductsPage() {
//    const navigate = useNavigate();
//    const [products, setProducts] = useState([]);
//    const [searchQuery, setSearchQuery] = useState("");
//    const [filteredProducts, setFilteredProducts] = useState(products);
//    const [loading, setLoading] = useState(true);

//    const getAuthToken = () => {
//    const user = JSON.parse(localStorage.getItem("user"));
//    return user?.token;
//  } ;

//    // ✅ Simulated loading effect
//    useEffect(() => {
//      const token = getAuthToken();
//      if (!token) {
//      navigate("/login");
//      return;
//    }


//      fetch("http://localhost:8080/api/products", {
//        headers: {
//          Authorization: `Bearer ${token}`,
//        },
//      })

//          .then(async (res) => {
//          if (!res.ok) throw new Error("Unauthorized");
//          return res.json();
//        })
//        .then((data) => {
//          setProducts(data);
//          setLoading(false);
//        }) 
//        .catch((err) => {
//          console.error(err);
//          setLoading(false);
//        });
        
//    }, []);




  

//    // ✅ Delete product
//    const handleDeleteProduct = async (id) => {
//      if (!window.confirm("Delete product?")) return;
//      try{
//      const token = getAuthToken();
//      if (!token) {
//        alert("Authentication token missing. Please login again.");
//        return;
//      }


//      const res =await fetch(`http://localhost:8080/api/products/${id}`, {
//        method: "DELETE",
//        headers: {
//          Authorization: `Bearer ${(token)}`,
//        },
//      });
//      if (!res.ok) {
//        const text = await res.text();
//        throw new Error(text || "Delete failed");
    
//    }

//    alert("Product deleted successfully");

//    setProducts((prev)=>prev.filter((p) => p.id !== id));

//    }catch (err) {
//      console.error(err);
//      alert("Failed to delete product");
//    }
//    };


//    // ✅ Download QR Code
//    const downloadQRCode = (id) => {
//      const canvas = document.getElementById(`qrcode-${id}`);
//      // if (!canvas) return;
//      const url = canvas.toDataURL();
//      const link = document.createElement("a");
//      link.href = url;
//      link.download = `product-${id}.png`;
//      link.click();
//    };

//    // ✅ Filter products
//    useEffect(() => {
//      if (!searchQuery.trim()) {
//       setFilteredProducts(products);
//      } else {
//        const q = searchQuery.toLowerCase();
//        setFilteredProducts(
//          products.filter(
//            (prod) =>
//              prod.cropType.toLowerCase().includes(q) ||
//              prod.soilType.toLowerCase().includes(q)
//          )
//        );     }
//    }, [searchQuery, products]);

//    return (
//      <div className="products-container">
//        {/* 🔹 Header */}
//          <h1 className="page-title">Farm Products</h1>
//           <div className="page-header">
//    <div className="search-bar">
//      <input
//        type="text"
//        placeholder="Search by crop or soil..."
//        value={searchQuery}
//        onChange={(e) => setSearchQuery(e.target.value)}
//        className="search-input"
//      />
//    </div>

//    <div className="header-buttons">
//      <button className="add-btn" onClick={() => navigate("/add-product")}>
//        + Add Product
//      </button>
//      <button className="logout-btn" onClick={() => navigate("/login")}>
//        Logout
//      </button>
//    </div>
//  </div>

//        {/* 🔹 Loading State */}
//        {loading ? (
//          <div className="loading">⏳ Loading products...</div>
//        ) : filteredProducts.length === 0 ? (
//          // 🔹 Empty State
//          <div className="empty-state">
//            <h2>No products found</h2>
//            <p>Try adjusting your search or add a new product.</p>
//            <button
//              className="btn add-btn"
//              onClick={() => navigate("/add-product")}
//            >
//              <span>➕</span> Add Your First Product
//            </button>
//          </div>
//        ) : (
//          // 🔹 Products Table
//          <div className="table-container">
//            <div className="table-wrapper">
//              <table className="products-table">
//                <thead>
//                  <tr>
//                    <th>Image</th>
//                    <th>Crop Type</th>
//                    <th>Soil Type</th>
//                    <th>Pesticides</th>
//                    <th>Harvest Date</th>
//                    <th>Latitude</th>
//                    <th>Longitude</th>
//                    <th>QR Code</th>
//                    <th>Actions</th>
//                  </tr>
//                </thead>
//                <tbody>
//                  {filteredProducts.map((prod, index) => (
//                    <tr key={prod.id || index}>
//                      {/* 🔹 Product Image */}
//                      <td>
//                        {prod.imageUrl ? (
//                          <img
//                            src={prod.imageUrl}
//                            alt={prod.cropType}
//                            className="product-img"
//                            onError={(e) => {
//                              e.target.src =
//                                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAiIGhlaWdodD0iNzAiIHZpZXdCb3g9IjAgMCA3MCA3MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjcwIiBoZWlnaHQ9IjcwIiBmaWxsPSIjRUVFRUVFIi8+Cjx0ZXh0IHg9IjM1IiB5PSIzNSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOTk5OTk5Ij5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4=";
//                            }}
//                          />
//                        ) : (
//                          <div className="no-image">No Image</div>
//                        )}
//                      </td>

//                      {/* 🔹 Product Details */}
//                      <td>{prod.cropType}</td>
//                      <td>{prod.soilType}</td>
//                      <td>{prod.pesticides}</td>
//                      <td>{prod.harvestDate}</td>
//                      <td>{prod.latitude}</td>
//                      <td>{prod.longitude}</td>

//                      {/* 🔹 QR Code */}
//                      <td>
//                        <div className="qr-container">
//                          <QRCodeCanvas
//                            id={`qrcode-${prod.id}`}
//                            value={`http://localhost:3000/product/${prod.id}`}
//                            size={80}
//                          />
//                          <div className="product-id">ID: {prod.id}</div>
//                          <button
//                            className="btn qr-btn"
//                            onClick={() => downloadQRCode(prod.id)}
//                          >
//                            ⬇️ QR
//                          </button>
//                        </div>
//                      </td>

//                      {/* 🔹 Actions */}
//                      <td className="actions-cell">
//                        <button
//                          className="btn edit-btn"
//                          onClick={() => navigate(`/edit-product/${prod.id}`)}
//                        >
//                          ✏️ Edit
//                        </button>
//                        <button
//                          className="btn delete-btn"
//                          onClick={() => handleDeleteProduct(prod.id)}
//                        >
//                          🗑️ Delete
//                        </button>
//                      </td>
//                    </tr>
//                  ))}
//                </tbody>
//              </table>
//            </div>
//          </div>
//        )}
//      </div>
//    );
//  }

//  export default ProductsPage;
