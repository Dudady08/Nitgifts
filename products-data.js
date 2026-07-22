/* ==========================================================================
  Nit Gifts - Centralized Products Database
  ========================================================================== */

const mockProducts = [
 {
  "id": "cam-1",
  "aliases": [
   "prod-3"
  ],
  "name": "Camiseta Minimalist Off-White",
  "category": "camisetas",
  "price": 89.9,
  "original_price": 109.9,
  "image_url": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop",
  "hover_image_url": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop",
  "gallery_urls": [
   "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop",
   "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop"
  ],
  "is_bestseller": true,
  "is_new": false,
  "is_limited_edition": false,
  "product_type": "personalizado",
  "colors": [
   "branco",
   "cinza"
  ],
  "sizes": [
   "P",
   "M",
   "G",
   "GG"
  ],
  "material": "100% Algodão Egípcio",
  "weight_gsm": 180
 },
 {
  "id": "cam-2",
  "aliases": [
   "prod-4"
  ],
  "name": "Camiseta Artística Flor de Lótus",
  "category": "camisetas",
  "price": 99.9,
  "original_price": null,
  "image_url": "https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=600&auto=format&fit=crop",
  "hover_image_url": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=600&auto=format&fit=crop",
  "gallery_urls": [
   "https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=600&auto=format&fit=crop",
   "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=600&auto=format&fit=crop"
  ],
  "is_bestseller": false,
  "is_new": true,
  "is_limited_edition": false,
  "product_type": "exclusivo",
  "colors": [
   "preto",
   "branco",
   "azul"
  ],
  "sizes": [
   "P",
   "M",
   "G"
  ],
  "material": "100% Algodão Premium",
  "weight_gsm": 180
 },
 {
  "id": "cam-3",
  "aliases": [],
  "name": "Camiseta Forest Green Autoral",
  "category": "camisetas",
  "price": 49,
  "original_price": 69.9,
  "image_url": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=600&auto=format&fit=crop",
  "hover_image_url": "https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=600&auto=format&fit=crop",
  "gallery_urls": [
   "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=600&auto=format&fit=crop",
   "https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=600&auto=format&fit=crop"
  ],
  "is_bestseller": false,
  "is_new": false,
  "is_limited_edition": false,
  "product_type": "exclusivo",
  "colors": [
   "verde",
   "natural"
  ],
  "sizes": [
   "M",
   "G",
   "GG"
  ],
  "material": "100% Algodão Sustentável",
  "weight_gsm": 175
 },
 {
  "id": "cam-4",
  "aliases": [],
  "name": "Camiseta Bold Red Identity",
  "category": "camisetas",
  "price": 110,
  "original_price": null,
  "image_url": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop",
  "hover_image_url": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop",
  "gallery_urls": [
   "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop",
   "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop"
  ],
  "is_bestseller": true,
  "is_new": true,
  "is_limited_edition": true,
  "product_type": "personalizado",
  "colors": [
   "vermelho",
   "preto"
  ],
  "sizes": [
   "P",
   "M",
   "G",
   "GG"
  ],
  "material": "100% Algodão Premium",
  "weight_gsm": 180
 },
 {
  "id": "mol-1",
  "aliases": [
   "prod-1"
  ],
  "name": "Moletom Premium Classic Black",
  "category": "moletons",
  "price": 189.9,
  "original_price": 229.9,
  "image_url": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop",
  "hover_image_url": "https://images.unsplash.com/photo-1556821840-41602161ac7f?q=80&w=600&auto=format&fit=crop",
  "gallery_urls": [
   "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop",
   "https://images.unsplash.com/photo-1556821840-41602161ac7f?q=80&w=600&auto=format&fit=crop"
  ],
  "is_bestseller": true,
  "is_new": false,
  "is_limited_edition": true,
  "product_type": "exclusivo",
  "colors": [
   "preto",
   "cinza"
  ],
  "sizes": [
   "P",
   "M",
   "G",
   "GG"
  ],
  "material": "Algodão e Poliéster Premium",
  "weight_gsm": 320
 },
 {
  "id": "mol-2",
  "aliases": [
   "prod-2"
  ],
  "name": "Moletom Oversized Sand Desert",
  "category": "moletons",
  "price": 199.9,
  "original_price": null,
  "image_url": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop",
  "hover_image_url": "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=600&auto=format&fit=crop",
  "gallery_urls": [
   "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop",
   "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=600&auto=format&fit=crop"
  ],
  "is_bestseller": false,
  "is_new": true,
  "is_limited_edition": false,
  "product_type": "exclusivo",
  "colors": [
   "natural",
   "branco"
  ],
  "sizes": [
   "M",
   "G",
   "GG"
  ],
  "material": "Algodão e Poliéster Premium",
  "weight_gsm": 320
 },
 {
  "id": "can-stitch-cabo-rosa",
  "aliases": [
   "prod-5"
  ],
  "name": "Caneca Stitch - Cabo Rosa",
  "category": "canecas",
  "price": 80,
  "original_price": 89.9,
  "image_url": "canecas site/stitich cabo rosa 1 .jpg",
  "hover_image_url": "canecas site/Stitich cabo rosa 2 .jpg",
  "gallery_urls": [
   "canecas site/stitich cabo rosa 1 .jpg",
   "canecas site/Stitich cabo rosa 2 .jpg",
   "canecas site/stitich cabo rosa 3.jpg",
   "canecas site/stitich cabo rosa 4.jpg"
  ],
  "is_bestseller": true,
  "is_new": false,
  "is_limited_edition": true,
  "product_type": "personalizado",
  "colors": [
   "Rosa"
  ],
  "sizes": [
   "Único"
  ],
  "material": "Cerâmica Esmaltada Premium",
  "dimensions": "10x9cm (350ml)",
  "cabo_tipo": "colorida"
 },
 {
  "id": "can-mickey-cabo-coracao",
  "aliases": [
   "prod-6"
  ],
  "name": "Caneca Mickey - Cabo Coração",
  "category": "canecas",
  "price": 80,
  "original_price": null,
  "image_url": "canecas site/mickey cabo coração.jpg",
  "hover_image_url": "canecas site/mickey cabo coração 2.jpg",
  "gallery_urls": [
   "canecas site/mickey cabo coração 2.jpg",
   "canecas site/mickey cabo coração 3.jpg",
   "canecas site/mickey cabo coração 4.jpg",
   "canecas site/mickey cabo coração 5.jpg",
   "canecas site/mickey cabo coração.jpg"
  ],
  "is_bestseller": false,
  "is_new": true,
  "is_limited_edition": false,
  "product_type": "personalizado",
  "colors": [
   "Vermelho"
  ],
  "sizes": [
   "Único"
  ],
  "material": "Cerâmica Esmaltada Premium",
  "dimensions": "10x9cm (350ml)",
  "cabo_tipo": "coracao"
 },
 {
  "id": "can-amizade",
  "aliases": [
   "prod-9"
  ],
  "name": "Caneca Amizade",
  "category": "canecas",
  "price": 80,
  "original_price": null,
  "image_url": "canecas site/amizade (branco).jpg",
  "hover_image_url": "canecas site/amizade 2 (branco).jpg",
  "gallery_urls": [
   "canecas site/amizade (branco).jpg",
   "canecas site/amizade 2 (branco).jpg",
   "canecas site/amizade 3 (branco).jpg",
   "canecas site/amizade 4 (branco).jpg"
  ],
  "is_bestseller": false,
  "is_new": false,
  "is_limited_edition": false,
  "product_type": "personalizado",
  "colors": [
   "Branca"
  ],
  "sizes": [
   "Único"
  ],
  "material": "Cerâmica Esmaltada Premium",
  "dimensions": "10x9cm (350ml)",
  "cabo_tipo": "colorida"
 },
 {
  "id": "can-axe",
  "aliases": [
   "prod-10"
  ],
  "name": "Caneca Axé",
  "category": "canecas",
  "price": 80,
  "original_price": null,
  "image_url": "canecas site/axe (branco).jpg",
  "hover_image_url": "canecas site/axe 2 (branco).jpg",
  "gallery_urls": [
   "canecas site/axe (branco).jpg",
   "canecas site/axe 2 (branco).jpg",
   "canecas site/axe 3 (branco).jpg",
   "canecas site/axe 4 (branco).jpg",
   "canecas site/axe 5 (branco).jpg"
  ],
  "is_bestseller": false,
  "is_new": false,
  "is_limited_edition": false,
  "product_type": "personalizado",
  "colors": [
   "Branca"
  ],
  "sizes": [
   "Único"
  ],
  "material": "Cerâmica Esmaltada Premium",
  "dimensions": "10x9cm (350ml)",
  "cabo_tipo": "colorida"
 },
 {
  "id": "can-dorama",
  "aliases": [
   "prod-11"
  ],
  "name": "Caneca Dorama",
  "category": "canecas",
  "price": 80,
  "original_price": null,
  "image_url": "canecas site/dorama (branco).jpg",
  "hover_image_url": "canecas site/dorama 2 (branco).jpg",
  "gallery_urls": [
   "canecas site/dorama (branco).jpg",
   "canecas site/dorama 2 (branco).jpg",
   "canecas site/dorama 3 (branco).jpg",
   "canecas site/dorama 4 (branco).jpg",
   "canecas site/dorama 5 (branco).jpg"
  ],
  "is_bestseller": false,
  "is_new": false,
  "is_limited_edition": false,
  "product_type": "personalizado",
  "colors": [
   "Branca"
  ],
  "sizes": [
   "Único"
  ],
  "material": "Cerâmica Esmaltada Premium",
  "dimensions": "10x9cm (350ml)",
  "cabo_tipo": "colorida"
 },
 {
  "id": "can-iemanja",
  "aliases": [
   "prod-12"
  ],
  "name": "Caneca Iemanjá",
  "category": "canecas",
  "price": 80,
  "original_price": null,
  "image_url": "canecas site/iemanja 1 (branco).jpg",
  "hover_image_url": "canecas site/iemanja 2 (branco).jpg",
  "gallery_urls": [
   "canecas site/iemanja 1 (branco).jpg",
   "canecas site/iemanja 2 (branco).jpg",
   "canecas site/iemanja 3 (branco).jpg",
   "canecas site/iemanja 4 (branco).jpg",
   "canecas site/iemanja 5 (branco).jpg"
  ],
  "is_bestseller": false,
  "is_new": false,
  "is_limited_edition": false,
  "product_type": "personalizado",
  "colors": [
   "Branca"
  ],
  "sizes": [
   "Único"
  ],
  "material": "Cerâmica Esmaltada Premium",
  "dimensions": "10x9cm (350ml)",
  "cabo_tipo": "colorida"
 },
 {
  "id": "can-la-casa-de-papel",
  "aliases": [
   "prod-13"
  ],
  "name": "Caneca La Casa de Papel",
  "category": "canecas",
  "price": 80,
  "original_price": null,
  "image_url": "canecas site/la casa de papel (branco).jpg",
  "hover_image_url": "canecas site/la casa de papel 2 (branco).jpg",
  "gallery_urls": [
   "canecas site/la casa de papel (branco).jpg",
   "canecas site/la casa de papel 2 (branco).jpg",
   "canecas site/la casa de papel 3 (branco).jpg",
   "canecas site/la casa de papel 4 (branco).jpg",
   "canecas site/la casa de papel 5 (branco).jpg"
  ],
  "is_bestseller": false,
  "is_new": false,
  "is_limited_edition": false,
  "product_type": "personalizado",
  "colors": [
   "Branca"
  ],
  "sizes": [
   "Único"
  ],
  "material": "Cerâmica Esmaltada Premium",
  "dimensions": "10x9cm (350ml)",
  "cabo_tipo": "colorida"
 },
 {
  "id": "can-mickey-cabo-vermelho",
  "aliases": [
   "prod-14"
  ],
  "name": "Caneca Mickey - Cabo Vermelho",
  "category": "canecas",
  "price": 80,
  "original_price": null,
  "image_url": "canecas site/mickey cabo vermelho 1.jpg",
  "hover_image_url": "canecas site/mickey cabo vermelho 2.jpg",
  "gallery_urls": [
   "canecas site/mickey cabo vermelho 1.jpg",
   "canecas site/mickey cabo vermelho 2.jpg",
   "canecas site/mickey cabo vermelho 4.jpg",
   "canecas site/mickey cabo vermelho 5.jpg"
  ],
  "is_bestseller": false,
  "is_new": false,
  "is_limited_edition": false,
  "product_type": "personalizado",
  "colors": [
   "Vermelho"
  ],
  "sizes": [
   "Único"
  ],
  "material": "Cerâmica Esmaltada Premium",
  "dimensions": "10x9cm (350ml)",
  "cabo_tipo": "colorida"
 },
 {
  "id": "can-mickey-castelo",
  "aliases": [
   "prod-15"
  ],
  "name": "Caneca Mickey Castelo",
  "category": "canecas",
  "price": 80,
  "original_price": null,
  "image_url": "canecas site/mickey castelo 1(branco).jpg",
  "hover_image_url": "canecas site/mickey castelo 2(branco).jpg",
  "gallery_urls": [
   "canecas site/mickey castelo 1(branco).jpg",
   "canecas site/mickey castelo 2(branco).jpg",
   "canecas site/mickey castelo 3(branco).jpg",
   "canecas site/mickey castelo 6(branco).jpg",
   "canecas site/mickey catelo 4(branco).jpg",
   "canecas site/mickey catelo 5(branco).jpg"
  ],
  "is_bestseller": false,
  "is_new": false,
  "is_limited_edition": false,
  "product_type": "personalizado",
  "colors": [
   "Branca"
  ],
  "sizes": [
   "Único"
  ],
  "material": "Cerâmica Esmaltada Premium",
  "dimensions": "10x9cm (350ml)",
  "cabo_tipo": "colorida"
 },
 {
  "id": "can-naruto",
  "aliases": [
   "prod-16"
  ],
  "name": "Caneca Naruto",
  "category": "canecas",
  "price": 80,
  "original_price": null,
  "image_url": "canecas site/naruto 1 cabo laranja.jpg",
  "hover_image_url": "canecas site/naruto 2 cabo laranja.jpg",
  "gallery_urls": [
   "canecas site/naruto 1 cabo laranja.jpg",
   "canecas site/naruto 2 cabo laranja.jpg",
   "canecas site/naruto 3 cabo laranja.jpg",
   "canecas site/naruto 4 cabo laranja.jpg",
   "canecas site/naruto 6 cabo laranja.jpg",
   "canecas site/naruto 7 cabo laranja.jpg"
  ],
  "is_bestseller": false,
  "is_new": false,
  "is_limited_edition": false,
  "product_type": "personalizado",
  "colors": [
   "Laranja"
  ],
  "sizes": [
   "Único"
  ],
  "material": "Cerâmica Esmaltada Premium",
  "dimensions": "10x9cm (350ml)",
  "cabo_tipo": "colorida"
 },
 {
  "id": "can-nossa-senhora",
  "aliases": [
   "prod-17"
  ],
  "name": "Caneca Nossa Senhora",
  "category": "canecas",
  "price": 80,
  "original_price": null,
  "image_url": "canecas site/nossa senhora 1(branco).jpg",
  "hover_image_url": "canecas site/nossa senhora 2(branco).jpg",
  "gallery_urls": [
   "canecas site/nossa senhora 1(branco).jpg",
   "canecas site/nossa senhora 2(branco).jpg",
   "canecas site/nossa senhora 3(branco).jpg",
   "canecas site/nossa senhora 4(branco).jpg"
  ],
  "is_bestseller": false,
  "is_new": false,
  "is_limited_edition": false,
  "product_type": "personalizado",
  "colors": [
   "Branca"
  ],
  "sizes": [
   "Único"
  ],
  "material": "Cerâmica Esmaltada Premium",
  "dimensions": "10x9cm (350ml)",
  "cabo_tipo": "colorida"
 },
 {
  "id": "can-pinta",
  "aliases": [
   "prod-18"
  ],
  "name": "Caneca Pinta",
  "category": "canecas",
  "price": 80,
  "original_price": null,
  "image_url": "canecas site/pinta(branco).jpg",
  "hover_image_url": "canecas site/pinta 2(branco).jpg",
  "gallery_urls": [
   "canecas site/pinta 2(branco).jpg",
   "canecas site/pinta 3(branco).jpg",
   "canecas site/pinta 4(branco).jpg",
   "canecas site/pinta(branco).jpg"
  ],
  "is_bestseller": false,
  "is_new": false,
  "is_limited_edition": false,
  "product_type": "personalizado",
  "colors": [
   "Branca"
  ],
  "sizes": [
   "Único"
  ],
  "material": "Cerâmica Esmaltada Premium",
  "dimensions": "10x9cm (350ml)",
  "cabo_tipo": "colorida"
 },
 {
  "id": "can-pintura",
  "aliases": [
   "prod-19"
  ],
  "name": "Caneca Pintura",
  "category": "canecas",
  "price": 80,
  "original_price": null,
  "image_url": "canecas site/pintura cabo marrom.jpg",
  "hover_image_url": "canecas site/pintura 2 cabo marrom.jpg",
  "gallery_urls": [
   "canecas site/pintura 2 cabo marrom.jpg",
   "canecas site/pintura 3 cabo marrom.jpg",
   "canecas site/pintura 4 cabo marrom.jpg",
   "canecas site/pintura 5 cabo marrom.jpg",
   "canecas site/pintura cabo marrom.jpg"
  ],
  "is_bestseller": false,
  "is_new": false,
  "is_limited_edition": false,
  "product_type": "personalizado",
  "colors": [
   "Marrom"
  ],
  "sizes": [
   "Único"
  ],
  "material": "Cerâmica Esmaltada Premium",
  "dimensions": "10x9cm (350ml)",
  "cabo_tipo": "colorida"
 },
 {
  "id": "can-signo",
  "aliases": [
   "prod-20"
  ],
  "name": "Caneca Signo",
  "category": "canecas",
  "price": 80,
  "original_price": null,
  "image_url": "canecas site/signo 1 cabo preto.jpg",
  "hover_image_url": "canecas site/signo 2 cabo preto.jpg",
  "gallery_urls": [
   "canecas site/signo 1 cabo preto.jpg",
   "canecas site/signo 2 cabo preto.jpg",
   "canecas site/signo 4 cabo preto.jpg",
   "canecas site/signo 7 cabo preto.jpg",
   "canecas site/signo 9 cabo preto.jpg"
  ],
  "is_bestseller": true,
  "is_new": false,
  "is_limited_edition": false,
  "product_type": "personalizado",
  "colors": [
   "Preto"
  ],
  "sizes": [
   "Único"
  ],
  "material": "Cerâmica Esmaltada Premium",
  "dimensions": "10x9cm (350ml)",
  "cabo_tipo": "colorida"
 },
 {
  "id": "can-skz",
  "aliases": [
   "prod-21"
  ],
  "name": "Caneca Stray Kids",
  "category": "canecas",
  "price": 80,
  "original_price": null,
  "image_url": "canecas site/skz(branco).jpg",
  "hover_image_url": "canecas site/skz 2 (branco).jpg",
  "gallery_urls": [
   "canecas site/skz 2 (branco).jpg",
   "canecas site/skz 3(branco).jpg",
   "canecas site/skz 4(branco).jpg",
   "canecas site/skz 5(branco).jpg",
   "canecas site/skz 6(branco).jpg",
   "canecas site/skz(branco).jpg"
  ],
  "is_bestseller": false,
  "is_new": false,
  "is_limited_edition": false,
  "product_type": "personalizado",
  "colors": [
   "Branca"
  ],
  "sizes": [
   "Único"
  ],
  "material": "Cerâmica Esmaltada Premium",
  "dimensions": "10x9cm (350ml)",
  "cabo_tipo": "colorida"
 },
 {
  "id": "can-sophia",
  "aliases": [
   "prod-22"
  ],
  "name": "Caneca Sophia",
  "category": "canecas",
  "price": 80,
  "original_price": null,
  "image_url": "canecas site/sophia 1(branco).jpg",
  "hover_image_url": "canecas site/sophia 2(branco).jpg",
  "gallery_urls": [
   "canecas site/sophia 1(branco).jpg",
   "canecas site/sophia 2(branco).jpg",
   "canecas site/sophia 3(branco).jpg",
   "canecas site/sophia 4(branco).jpg"
  ],
  "is_bestseller": false,
  "is_new": false,
  "is_limited_edition": false,
  "product_type": "personalizado",
  "colors": [
   "Branca"
  ],
  "sizes": [
   "Único"
  ],
  "material": "Cerâmica Esmaltada Premium",
  "dimensions": "10x9cm (350ml)",
  "cabo_tipo": "colorida"
 },
 {
  "id": "can-studio",
  "aliases": [
   "prod-23"
  ],
  "name": "Caneca Studio",
  "category": "canecas",
  "price": 80,
  "original_price": null,
  "image_url": "canecas site/studio.jpg",
  "hover_image_url": "canecas site/studio 2 (branco).jpg",
  "gallery_urls": [
   "canecas site/studio 2 (branco).jpg",
   "canecas site/studio 3(branco).jpg",
   "canecas site/studio 4(branco).jpg",
   "canecas site/studio 5(branco).jpg",
   "canecas site/studio.jpg"
  ],
  "is_bestseller": false,
  "is_new": false,
  "is_limited_edition": false,
  "product_type": "personalizado",
  "colors": [
   "Branca"
  ],
  "sizes": [
   "Único"
  ],
  "material": "Cerâmica Esmaltada Premium",
  "dimensions": "10x9cm (350ml)",
  "cabo_tipo": "colorida"
 },
 {
  "id": "can-star",
  "aliases": [
   "prod-24"
  ],
  "name": "Caneca Star",
  "category": "canecas",
  "price": 80,
  "original_price": null,
  "image_url": "canecas site/star cabo preto.jpg",
  "hover_image_url": "canecas site/star 2 cabo preto.jpg",
  "gallery_urls": [
   "canecas site/star 2 cabo preto.jpg",
   "canecas site/star 3 cabo preto.jpg",
   "canecas site/star 4 cabo preto.jpg",
   "canecas site/star 6 cabo preto.jpg",
   "canecas site/star cabo preto.jpg"
  ],
  "is_bestseller": false,
  "is_new": false,
  "is_limited_edition": false,
  "product_type": "personalizado",
  "colors": [
   "Preto"
  ],
  "sizes": [
   "Único"
  ],
  "material": "Cerâmica Esmaltada Premium",
  "dimensions": "10x9cm (350ml)",
  "cabo_tipo": "colorida"
 },
 {
  "id": "can-stitch-boca",
  "aliases": [
   "prod-25"
  ],
  "name": "Caneca Stitch Boca",
  "category": "canecas",
  "price": 80,
  "original_price": null,
  "image_url": "canecas site/stitich boca 1(branco).jpg",
  "hover_image_url": "canecas site/stitich boca 2 (branco).jpg",
  "gallery_urls": [
   "canecas site/stitich boca 1(branco).jpg",
   "canecas site/stitich boca 2 (branco).jpg",
   "canecas site/stitich boca 3(branco).jpg",
   "canecas site/stitich boca 4(branco).jpg",
   "canecas site/stitich boca 5(branco).jpg",
   "canecas site/stitich boca 6(branco).jpg"
  ],
  "is_bestseller": false,
  "is_new": false,
  "is_limited_edition": false,
  "product_type": "personalizado",
  "colors": [
   "Branca"
  ],
  "sizes": [
   "Único"
  ],
  "material": "Cerâmica Esmaltada Premium",
  "dimensions": "10x9cm (350ml)",
  "cabo_tipo": "colorida"
 },
 {
  "id": "can-espirito-santo",
  "aliases": [
   "prod-26"
  ],
  "name": "Caneca Espírito Santo",
  "category": "canecas",
  "price": 80,
  "original_price": null,
  "image_url": "canecas site/espirito santo cabo (azul).jpg",
  "hover_image_url": "canecas site/espirito santo 2 (azul).jpg",
  "gallery_urls": [
   "canecas site/espirito santo 2 (azul).jpg",
   "canecas site/espirito santo 3 (azul).jpg",
   "canecas site/espirito santo 4 (azul).jpg",
   "canecas site/espirito santo 5 (azul).jpg",
   "canecas site/espirito santo cabo (azul).jpg"
  ],
  "is_bestseller": false,
  "is_new": false,
  "is_limited_edition": false,
  "product_type": "personalizado",
  "colors": [
   "Azul"
  ],
  "sizes": [
   "Único"
  ],
  "material": "Cerâmica Esmaltada Premium",
  "dimensions": "10x9cm (350ml)",
  "cabo_tipo": "colorida"
 },
 {
  "id": "can-marvel",
  "aliases": [
   "prod-27"
  ],
  "name": "Caneca Marvel",
  "category": "canecas",
  "price": 80,
  "original_price": null,
  "image_url": "canecas site/marvel (verde).jpg",
  "hover_image_url": "canecas site/marvel 2 (verde).jpg",
  "gallery_urls": [
   "canecas site/marvel (verde).jpg",
   "canecas site/marvel 2 (verde).jpg",
   "canecas site/marvel 3 (verde).jpg",
   "canecas site/marvel 4 (verde).jpg",
   "canecas site/marvel 5 (verde).jpg"
  ],
  "is_bestseller": false,
  "is_new": false,
  "is_limited_edition": false,
  "product_type": "personalizado",
  "colors": [
   "Verde"
  ],
  "sizes": [
   "Único"
  ],
  "material": "Cerâmica Esmaltada Premium",
  "dimensions": "10x9cm (350ml)",
  "cabo_tipo": "colorida"
 },
 {
  "id": "can-planeta",
  "aliases": [
   "prod-28"
  ],
  "name": "Caneca Planeta",
  "category": "canecas",
  "price": 80,
  "original_price": null,
  "image_url": "canecas site/planeta(branco).jpg",
  "hover_image_url": "canecas site/planeta 2(branco).jpg",
  "gallery_urls": [
   "canecas site/planeta 2(branco).jpg",
   "canecas site/planeta 3(branco).jpg",
   "canecas site/planeta 4(branco).jpg",
   "canecas site/planeta(branco).jpg"
  ],
  "is_bestseller": false,
  "is_new": false,
  "is_limited_edition": false,
  "product_type": "personalizado",
  "colors": [
   "Branca"
  ],
  "sizes": [
   "Único"
  ],
  "material": "Cerâmica Esmaltada Premium",
  "dimensions": "10x9cm (350ml)",
  "cabo_tipo": "colorida"
 },
 {
  "id": "can-pokemon",
  "aliases": [
   "prod-29"
  ],
  "name": "Caneca Pokémon",
  "category": "canecas",
  "price": 80,
  "original_price": null,
  "image_url": "canecas site/pokemon(branco).jpg",
  "hover_image_url": "canecas site/pokemon 2(branco).jpg",
  "gallery_urls": [
   "canecas site/pokemon 2(branco).jpg",
   "canecas site/pokemon 3(branco).jpg",
   "canecas site/pokemon 4(branco).jpg",
   "canecas site/pokemon(branco).jpg"
  ],
  "is_bestseller": false,
  "is_new": false,
  "is_limited_edition": false,
  "product_type": "personalizado",
  "colors": [
   "Branca"
  ],
  "sizes": [
   "Único"
  ],
  "material": "Cerâmica Esmaltada Premium",
  "dimensions": "10x9cm (350ml)",
  "cabo_tipo": "colorida"
 },
 {
  "id": "can-sem-cafe",
  "aliases": [
   "prod-30"
  ],
  "name": "Caneca Sem Café",
  "category": "canecas",
  "price": 80,
  "original_price": null,
  "image_url": "canecas site/sem café 1(branco).jpg",
  "hover_image_url": "canecas site/sem café 2 (branco).jpg",
  "gallery_urls": [
   "canecas site/sem café 1(branco).jpg",
   "canecas site/sem café 2 (branco).jpg",
   "canecas site/sem café 3(branco).jpg",
   "canecas site/sem café 4(branco).jpg",
   "canecas site/sem café 5(branco).jpg",
   "canecas site/sem café 6(branco).jpg"
  ],
  "is_bestseller": false,
  "is_new": false,
  "is_limited_edition": false,
  "product_type": "personalizado",
  "colors": [
   "Branca"
  ],
  "sizes": [
   "Único"
  ],
  "material": "Cerâmica Esmaltada Premium",
  "dimensions": "10x9cm (350ml)",
  "cabo_tipo": "colorida"
 },
 {
  "id": "can-sao-jorge",
  "aliases": [
   "prod-31"
  ],
  "name": "Caneca São Jorge",
  "category": "canecas",
  "price": 80,
  "original_price": null,
  "image_url": "canecas site/são jorge cabo verde.jpg",
  "hover_image_url": "canecas site/são jorge 2 cabo verde.jpg",
  "gallery_urls": [
   "canecas site/são jorge 2 cabo verde.jpg",
   "canecas site/são jorge 3 cabo verde.jpg",
   "canecas site/são jorge 4 cabo verde.jpg",
   "canecas site/são jorge 5 cabo verde.jpg",
   "canecas site/são jorge 6 cabo verde.jpg",
   "canecas site/são jorge cabo verde.jpg"
  ],
  "is_bestseller": false,
  "is_new": false,
  "is_limited_edition": false,
  "product_type": "personalizado",
  "colors": [
   "Verde"
  ],
  "sizes": [
   "Único"
  ],
  "material": "Cerâmica Esmaltada Premium",
  "dimensions": "10x9cm (350ml)",
  "cabo_tipo": "colorida"
 },
 {
  "id": "can-mulher-maravilha-magica",
  "aliases": [
   "prod-32"
  ],
  "name": "Caneca Mulher Maravilha Caneca Mágica",
  "category": "canecas",
  "price": 80,
  "original_price": null,
  "image_url": "canecas site/mulher maravilha caneca magica 1.jpg",
  "hover_image_url": "canecas site/mulher maravilha caneca magica 3.jpg",
  "gallery_urls": [
   "canecas site/mulher maravilha caneca magica 1.jpg",
   "canecas site/mulher maravilha caneca magica 3.jpg",
   "canecas site/mulher maravilha caneca magica 4.jpg",
   "canecas site/mulher maravilha caneca magica 5.jpg",
   "canecas site/caneca magica 2.jpg",
   "canecas site/caneca magica 3.jpg",
   "canecas site/caneca magica 4.jpg",
   "canecas site/caneca magica 5.jpg",
   "canecas site/caneca magica 6.jpg",
   "canecas site/caneca magica.jpg"
  ],
  "is_bestseller": false,
  "is_new": false,
  "is_limited_edition": false,
  "product_type": "personalizado",
  "colors": [
   "Preto"
  ],
  "sizes": [
   "Único"
  ],
  "material": "Cerâmica Esmaltada Premium (Termossensível)",
  "dimensions": "10x9cm (350ml)",
  "cabo_tipo": "magica"
 },
 {
  "id": "can-orixa-magica",
  "aliases": [
   "prod-33"
  ],
  "name": "Caneca Orixá Caneca Mágica",
  "category": "canecas",
  "price": 80,
  "original_price": null,
  "image_url": "canecas site/orixá caneca magica 1.jpg",
  "hover_image_url": "canecas site/orixá caneca magica 2.jpg",
  "gallery_urls": [
   "canecas site/orixá caneca magica 1.jpg",
   "canecas site/orixá caneca magica 2.jpg",
   "canecas site/orixá caneca magica 3.jpg",
   "canecas site/orixá caneca magica 7.jpg",
   "canecas site/orixá caneca magica 8.jpg",
   "canecas site/orixá caneca magica 9.jpg",
   "canecas site/caneca magica 2.jpg",
   "canecas site/caneca magica 3.jpg",
   "canecas site/caneca magica 4.jpg",
   "canecas site/caneca magica 5.jpg",
   "canecas site/caneca magica 6.jpg",
   "canecas site/caneca magica.jpg"
  ],
  "is_bestseller": false,
  "is_new": false,
  "is_limited_edition": false,
  "product_type": "personalizado",
  "colors": [
   "Preto"
  ],
  "sizes": [
   "Único"
  ],
  "material": "Cerâmica Esmaltada Premium (Termossensível)",
  "dimensions": "10x9cm (350ml)",
  "cabo_tipo": "magica"
 },
 {
  "id": "ima-1",
  "aliases": [],
  "name": "Kit Ímãs Ilustrados Café",
  "category": "gifts",
  "price": 24.9,
  "original_price": 29.9,
  "image_url": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop",
  "hover_image_url": null,
  "gallery_urls": [
   "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop"
  ],
  "is_bestseller": true,
  "is_new": false,
  "is_limited_edition": false,
  "product_type": "exclusivo",
  "colors": [
   "cinza",
   "natural"
  ],
  "sizes": [
   "Único"
  ],
  "material": "Ímã Emborrachado Flexível",
  "dimensions": "8x8cm (cada)"
 },
 {
  "id": "eco-1",
  "aliases": [],
  "name": "Ecobag Resistente Flores Silvestres",
  "category": "ecobags",
  "price": 39.9,
  "original_price": null,
  "image_url": "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop",
  "hover_image_url": null,
  "gallery_urls": [
   "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop"
  ],
  "is_bestseller": true,
  "is_new": true,
  "is_limited_edition": false,
  "product_type": "personalizado",
  "colors": [
   "natural",
   "preto"
  ],
  "sizes": [
   "Único"
  ],
  "material": "100% Algodão Cru Ecológico",
  "dimensions": "40x45cm"
 },
 {
  "id": "mdf-1",
  "aliases": [
   "mdf-1"
  ],
  "name": "BTS",
  "category": "placas-mdf",
  "price": 50,
  "original_price": null,
  "image_url": "Placas de MDF/BTS (exclusiva).jpg",
  "hover_image_url": "Placas de MDF/BTS (exclusiva).jpg",
  "gallery_urls": [
   "Placas de MDF/BTS.jpg"
  ],
  "is_bestseller": false,
  "is_new": true,
  "is_limited_edition": false,
  "product_type": "exclusivo",
  "colors": [],
  "sizes": [
   "Único"
  ],
  "material": "MDF Premium",
  "dimensions": "20x20cm"
 },
 {
  "id": "mdf-2",
  "aliases": [
   "mdf-2"
  ],
  "name": "Luffy",
  "category": "placas-mdf",
  "price": 50,
  "original_price": null,
  "image_url": "Placas de MDF/Luffy (exclusiva).jpg",
  "hover_image_url": "Placas de MDF/Luffy (exclusiva).jpg",
  "gallery_urls": [
   "Placas de MDF/Luffy.jpg"
  ],
  "is_bestseller": false,
  "is_new": true,
  "is_limited_edition": false,
  "product_type": "exclusivo",
  "colors": [],
  "sizes": [
   "Único"
  ],
  "material": "MDF Premium",
  "dimensions": "20x20cm"
 },
 {
  "id": "mdf-3",
  "aliases": [
   "mdf-3"
  ],
  "name": "Onça",
  "category": "placas-mdf",
  "price": 50,
  "original_price": null,
  "image_url": "Placas de MDF/Onça (exclusiva).jpg",
  "hover_image_url": "Placas de MDF/Onça (exclusiva).jpg",
  "gallery_urls": [
   "Placas de MDF/Onça.jpg"
  ],
  "is_bestseller": false,
  "is_new": true,
  "is_limited_edition": false,
  "product_type": "exclusivo",
  "colors": [],
  "sizes": [
   "Único"
  ],
  "material": "MDF Premium",
  "dimensions": "20x20cm"
 },
 {
  "id": "mdf-4",
  "aliases": [
   "mdf-4"
  ],
  "name": "Studio Ghibli",
  "category": "placas-mdf",
  "price": 50,
  "original_price": null,
  "image_url": "Placas de MDF/Studio ghibli (exclusiva).jpg",
  "hover_image_url": "Placas de MDF/Studio ghibli (exclusiva).jpg",
  "gallery_urls": [
   "Placas de MDF/Studio ghibli 1.jpg"
  ],
  "is_bestseller": false,
  "is_new": true,
  "is_limited_edition": false,
  "product_type": "exclusivo",
  "colors": [],
  "sizes": [
   "Único"
  ],
  "material": "MDF Premium",
  "dimensions": "20x20cm"
 },
 {
  "id": "mdf-5",
  "aliases": [
   "mdf-5"
  ],
  "name": "Zoro",
  "category": "placas-mdf",
  "price": 50,
  "original_price": null,
  "image_url": "Placas de MDF/Zoro (exclusiva).jpg",
  "hover_image_url": "Placas de MDF/Zoro (exclusiva).jpg",
  "gallery_urls": [
   "Placas de MDF/Zoro.jpg"
  ],
  "is_bestseller": false,
  "is_new": true,
  "is_limited_edition": false,
  "product_type": "exclusivo",
  "colors": [],
  "sizes": [
   "Único"
  ],
  "material": "MDF Premium",
  "dimensions": "20x20cm"
 },
 {
  "id": "mdf-6",
  "aliases": [
   "mdf-6"
  ],
  "name": "Anime",
  "category": "placas-mdf",
  "price": 50,
  "original_price": null,
  "image_url": "Placas de MDF/Anime (exclusiva).jpg",
  "hover_image_url": "Placas de MDF/Anime (exclusiva).jpg",
  "gallery_urls": [
   "Placas de MDF/Anime.jpg"
  ],
  "is_bestseller": false,
  "is_new": true,
  "is_limited_edition": false,
  "product_type": "exclusivo",
  "colors": [],
  "sizes": [
   "Único"
  ],
  "material": "MDF Premium",
  "dimensions": "20x20cm"
 },
 {
  "id": "mdf-7",
  "aliases": [
   "mdf-7"
  ],
  "name": "Frase Personalizada",
  "category": "placas-mdf",
  "price": 50,
  "original_price": null,
  "image_url": "Placas de MDF/Frase personalizasa (personalizado).png",
  "hover_image_url": "Placas de MDF/Frase personalizasa (personalizado).png",
  "gallery_urls": [
   "Placas de MDF/Frase personalizasa.png"
  ],
  "is_bestseller": false,
  "is_new": true,
  "is_limited_edition": false,
  "product_type": "personalizado",
  "colors": [],
  "sizes": [
   "Único"
  ],
  "material": "MDF Premium",
  "dimensions": "20x20cm"
 },
 {
  "id": "mdf-8",
  "aliases": [
   "mdf-8"
  ],
  "name": "Ovelha",
  "category": "placas-mdf",
  "price": 50,
  "original_price": null,
  "image_url": "Placas de MDF/Ovelha (personalizado).png",
  "hover_image_url": "Placas de MDF/Ovelha (personalizado).png",
  "gallery_urls": [
   "Placas de MDF/Ovelha.png"
  ],
  "is_bestseller": false,
  "is_new": true,
  "is_limited_edition": false,
  "product_type": "personalizado",
  "colors": [],
  "sizes": [
   "Único"
  ],
  "material": "MDF Premium",
  "dimensions": "20x20cm"
 }
];
