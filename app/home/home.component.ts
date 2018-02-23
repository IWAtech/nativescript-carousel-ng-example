 /* tslint:disable */

const Carousel = require('nativescript-carousel').Carousel;
import { Component, OnInit, ComponentFactoryResolver, ViewContainerRef, Type, ComponentRef, ReflectiveInjector } from "@angular/core";
import { EventData } from "tns-core-modules/data/observable";
import { renderCarouselSlides, addItemToCarousel, carouselItemFromView } from "../common/support";
import { PercentLength } from "tns-core-modules/ui/styling/style-properties";
import { Image } from "tns-core-modules/ui/image";
import { GridLayout, GridUnitType, ItemSpec } from "tns-core-modules/ui/layouts/grid-layout";
import { Button } from "tns-core-modules/ui/button";
import * as Rx from "rxjs";
import { ItemComponent } from './item.component';
import { Page } from "tns-core-modules/ui/page";
import { View } from "tns-core-modules/ui/core/view";

import { DetachedLoader, PageFactory, PAGE_FACTORY, ModalDialogOptions, ModalDialogParams } from "nativescript-angular";

// tslint:disable-next-line:interface-name
interface ShowDialogOptions<T> {
  containerRef: ViewContainerRef;
  context: any;
  doneCallback;
  fullscreen: boolean;
  pageFactory: PageFactory;
  parentPage: Page;
  resolver: ComponentFactoryResolver;
  type: Type<T>;
}

@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home.component.html"
})
export class HomeComponent {

    public categories = [
      'abstract',
      'animals',
      'business',
      'cats',
      'city',
      'food',
      'nightlife',
      'fashion',
      'people',
      'nature',
      'sports',
      'technics',
      'transport'];

    loading = true;

    private subject: Rx.Subject<{ images: { src: string; }[] }> = new Rx.AsyncSubject();

    private carouselComponents: ComponentRef<ItemComponent>[] = [];

    constructor(
      private componentFactoryResolver: ComponentFactoryResolver,
      private viewContainerRef: ViewContainerRef
    ) {
        this.subject.next({
            images: [
                {
                    src: 'https://lorempixel.com/800/600/city/2/'
                },
                {
                    src: 'https://lorempixel.com/800/600/nightlife/6/'
                },
                {
                    src: 'https://lorempixel.com/800/600/nightlife/5/'
                }
            ]
        });

        this.subject.subscribe({
            next: (data) => {
                this.loading = false;
            }
        });

        setTimeout(() => this.subject.complete(), 3000);
    }

    getRandomCategory() {
      return this.categories[Math.floor(Math.random() * this.categories.length)]
    }

    onCarouselLoad(args: EventData): void {
        this.subject.subscribe({
            next: (data) => {

              console.log('rendering labels');

                const carousel: typeof Carousel = args.object;

                const promises = data.images.map(() => {
                  console.log('show modal rendering');
                  return this.showModal(ItemComponent, {viewContainerRef: this.viewContainerRef, context: { category: this.getRandomCategory()}});
                });

                Promise.all(promises).then((componentRefs) => {
                  console.log('got views, rendering');
                  const views = componentRefs.map((componentRef) => { return componentRef.location.nativeElement })
                  componentRefs.forEach((ref) => {
                    this.carouselComponents.push(ref);
                  });
                  renderCarouselSlides(
                    carousel,
                    views
                  );

                  setInterval(() => {
                    this.showModal(ItemComponent, {viewContainerRef: this.viewContainerRef, context: { category: this.getRandomCategory()}}).then((componentRef) => {
                      this.carouselComponents.push(componentRef);
                      const view = componentRef.location.nativeElement
                      const carouselItem = carouselItemFromView(view);
                      addItemToCarousel(carousel)(carouselItem, carousel.getChildrenCount());
                    });
                  }, 5000);
                }, (error) => {
                  console.log('error');
                  console.log(error);
                });

                carousel.on(Carousel.pageChangedEvent, (event) => {
                  const index: number = event.index + 0;
                  console.log('Got Page Changed Event' + index);

                  if(this.carouselComponents.length > index) {
                    this.carouselComponents[index].instance.isActive()
                  } else {
                    console.log('carouselcomponents to small ' + this.carouselComponents.length);
                  }


                  // console.log(JSON.stringify(event));
                });

                // carousel.on(Carousel.pageScrollStateChangedEvent, (event) => {
                //   console.log('Got Page Scroll Changed Event');
                //   console.log(JSON.stringify(event));
                // });
            },
        });
    }



      public showModal<T>(type: Type<T>,
          {viewContainerRef, moduleRef, context, fullscreen}: ModalDialogOptions
      ): Promise<ComponentRef<T>> {
          if (!viewContainerRef) {
              throw new Error(
                  "No viewContainerRef: " +
                  "Make sure you pass viewContainerRef in ModalDialogOptions."
              );
          }

          const parentPage: Page = viewContainerRef.injector.get(Page);
          const pageFactory: PageFactory = viewContainerRef.injector.get(PAGE_FACTORY);

          // resolve from particular module (moduleRef)
          // or from same module as parentPage (viewContainerRef)
          const componentContainer = moduleRef || viewContainerRef;
          const resolver = componentContainer.injector.get(ComponentFactoryResolver);

          return new Promise(resolve => {
              setTimeout(() => resolve(HomeComponent.showDialog({
                  containerRef: viewContainerRef,
                  context,
                  doneCallback: () => {},
                  fullscreen,
                  pageFactory,
                  parentPage,
                  resolver,
                  type,
              })), 10);
          });
      }

      private static showDialog<T>({
          containerRef,
          context,
          doneCallback,
          fullscreen,
          pageFactory,
          parentPage,
          resolver,
          type,
      }: ShowDialogOptions<T>): Promise<ComponentRef<T>> {
          console.log("showDialog called");
          const page = pageFactory({ isModal: true, componentType: type });

          let detachedLoaderRef: ComponentRef<DetachedLoader>;
          const closeCallback = (...args) => {
              doneCallback.apply(undefined, args);
              page.closeModal();
              detachedLoaderRef.instance.detectChanges();
              detachedLoaderRef.destroy();
          };

          const modalParams = new ModalDialogParams(context, closeCallback);

          const providers = ReflectiveInjector.resolve([
              { provide: Page, useValue: page },
              { provide: ModalDialogParams, useValue: modalParams },
          ]);

          const childInjector = ReflectiveInjector.fromResolvedProviders(
              providers, containerRef.parentInjector);
          const detachedFactory = resolver.resolveComponentFactory(DetachedLoader);
          detachedLoaderRef = containerRef.createComponent(detachedFactory, -1, childInjector, null);
          console.log("loading component");
          return detachedLoaderRef.instance.loadComponent(type).then((compRef) => {
              console.log('component loaded');
              const componentView = <View>compRef.location.nativeElement;

              if (componentView.parent) {
                  (<any>componentView.parent).removeChild(componentView);
              }

              return compRef;

              // page.content = componentView;
              // parentPage.showModal(page, context, closeCallback, fullscreen);
          });
      }
}
