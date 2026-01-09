package com.farmxchain.controller;

import com.farmxchain.model.Product;
import com.farmxchain.service.ProductService;
import com.farmxchain.service.ImageUploadService;
import com.farmxchain.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private ImageUploadService imageUploadService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/all")
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/farmer/{farmerId}")
    public List<Product> getProductsByFarmer(@PathVariable Long farmerId) {
        return productService.getProductsByFarmer(farmerId);
    }
    
    @GetMapping
    @PreAuthorize("hasRole('FARMER')")
    public List<Product> getProductsForCurrentFarmer(
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.replace("Bearer ", "");
        Long farmerId = jwtUtil.extractFarmerId(token);
        return productService.getProductsByFarmer(farmerId);
    }
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<Product> getProductById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.replace("Bearer ", "");
        Long farmerId = jwtUtil.extractFarmerId(token);

        Product product = productService.getProductById(id);

        // 🔐 Ensure farmer owns the product
        if (!product.getFarmerId().equals(farmerId)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(product);
    }
   
    @PostMapping("/add")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<Product> addProduct(
            @RequestParam("image") MultipartFile image,
            @RequestParam("cropType") String cropType,
            @RequestParam("soilType") String soilType,
            @RequestParam("pesticides") String pesticides,
            @RequestParam("harvestDate") String harvestDate,
            @RequestParam("latitude") String latitude,
            @RequestParam("longitude") String longitude,
            @RequestHeader("Authorization") String authHeader // JWT from frontend
    ) throws IOException {

        // 1️⃣ Extract JWT token
        String token = authHeader.replace("Bearer ", "");

        // 2️⃣ Extract farmerId from JWT
        Long farmerId = jwtUtil.extractFarmerId(token); // implement in JwtUtil

        // 3️⃣ Upload image to Cloudinary
        String imageUrl = imageUploadService.uploadImage(image);

        // 4️⃣ Create product object
        Product product = new Product();
        product.setCropType(cropType);
        product.setSoilType(soilType);
        product.setPesticides(pesticides);
        product.setHarvestDate(harvestDate);
        product.setLatitude(Double.parseDouble(latitude));
        product.setLongitude(Double.parseDouble(longitude));
        product.setImageUrl(imageUrl);
        product.setFarmerId(farmerId);

        // 5️⃣ Save product
        Product savedProduct = productService.addProduct(product);
        return ResponseEntity.ok(savedProduct);
    }
 // ✅ DELETE PRODUCT
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('FARMER')")
    
    public ResponseEntity<?> deleteProduct(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader
    ) {
    	try {

        String token = authHeader.replace("Bearer ", "");
        Long farmerId = jwtUtil.extractFarmerId(token);

        Product product = productService.getProductById(id);

        // 🔐 Ownership check
        if (!product.getFarmerId().equals(farmerId)) {
            return ResponseEntity.status(403).body("Not authorized to delete this product");
        }

        productService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(500).body("Delete failed");
    }
}


@PutMapping("/edit/{id}")
@PreAuthorize("hasRole('FARMER')")
public ResponseEntity<Product> updateProduct(
        @PathVariable Long id,
        @RequestParam("cropType") String cropType,
        @RequestParam("soilType") String soilType,
        @RequestParam("pesticides") String pesticides,
        @RequestParam("harvestDate") String harvestDate,
        @RequestParam(value = "image", required = false) MultipartFile image,
        @RequestHeader("Authorization") String authHeader
) throws IOException {

    String token = authHeader.replace("Bearer ", "");
    Long farmerId = jwtUtil.extractFarmerId(token);

    Product product = productService.getProductById(id);

    // 🔐 Ownership check
    if (!product.getFarmerId().equals(farmerId)) {
        return ResponseEntity.status(403).build();
    }

    product.setCropType(cropType);
    product.setSoilType(soilType);
    product.setPesticides(pesticides);
    product.setHarvestDate(harvestDate);

    if (image != null && !image.isEmpty()) {
        String imageUrl = imageUploadService.uploadImage(image);
        product.setImageUrl(imageUrl);
    }

    Product updatedProduct = productService.updateProduct(product);
    return ResponseEntity.ok(updatedProduct);
}
}
