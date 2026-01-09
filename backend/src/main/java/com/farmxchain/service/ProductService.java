package com.farmxchain.service;

import com.farmxchain.model.Product;
import com.farmxchain.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getProductsByFarmer(Long farmerId) {
        return productRepository.findByFarmerId(farmerId);
    }

    public Product addProduct(Product product) {
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
    public Product getProductById(Long id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public Product updateProduct(Product product) {
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product updatedProduct) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setCropType(updatedProduct.getCropType());
        product.setSoilType(updatedProduct.getSoilType());
        product.setPesticides(updatedProduct.getPesticides());
        product.setHarvestDate(updatedProduct.getHarvestDate());
        product.setLatitude(updatedProduct.getLatitude());
        product.setLongitude(updatedProduct.getLongitude());
        product.setImageUrl(updatedProduct.getImageUrl());
        return productRepository.save(product);
    }
}
