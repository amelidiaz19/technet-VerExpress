import { Component, inject, input, OnInit  } from '@angular/core';
import { ProductDetailSateService } from '../../data-access/productos-detalle-state.service';
import { CartStateService } from '../../../data-access/cart-state.service';
import { CurrencyPipe } from '@angular/common';
import { environment } from '../../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { ProductoService } from '../../../../admin/services/producto.service';
import { MonedaService } from '../../../../admin/services/moneda.service';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './producto-detalle.component.html',
  providers: [ProductDetailSateService],
})

export default class ProductoDetalleComponent implements OnInit{

  url = environment.API_URL;
  productService = inject(ProductoService);
  cartState = inject(CartStateService).state;
  producto: any | null =null;
  imagenprincipal: string | undefined = '';
  id = input.required<string>();

  cambio: number = 1; // Valor inicial por defecto (soles a soles)
  precioEnDolares: number = 0;
  //5& tarjeta
  precio5S: number = 0;
  precio5D: number = 0;
  precio5SF: number = 0;
  precio5DF: number = 0;


  constructor(private route: ActivatedRoute, private mond: MonedaService) {}
  
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id') ?? '';
      this.productService.getProductoById(id).subscribe(res =>{
        this.producto = res;
        this.imagenprincipal = this.producto.imagen_principal;
        console.log(this.producto);

        // Luego obtener la tasa de cambio y hacer la conversión solo si el producto está disponible
        this.mond.getCambio().subscribe((data) => {
          this.cambio = data.rates.USD; // Asumiendo que recibes la tasa de cambio en USD
          this.convertirADolares(); // Convertir después de tener la tasa de cambio y el producto
        });

      })
    });
  }

  convertirADolares() {
    if (this.producto && this.producto.precio) {
      this.precioEnDolares = this.producto.precio / this.cambio;
      this.precio5S = this.producto.precio * 0.05;
      this.precio5D = this.precioEnDolares * 0.05;

      this.precio5SF = this.producto.precio + this.precio5S;
      this.precio5DF = this.precioEnDolares + this.precio5D;
    }
  }

  addToCart() {
    this.cartState.add({
      product: this.producto,
      quantity: 1,
    });
  }
  mostrarimg(event: Event){
    const imgElement = event.target as HTMLImageElement;
    this.imagenprincipal = imgElement.src;
  }
  
}
