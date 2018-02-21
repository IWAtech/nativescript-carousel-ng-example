import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";

import { HomeRoutingModule } from "./home-routing.module";
import { HomeComponent } from "./home.component";
import { ItemComponent } from "./item.component";

@NgModule({
    imports: [
        NativeScriptModule,
        HomeRoutingModule,
    ],
    declarations: [
        HomeComponent,
        ItemComponent,
    ],
    schemas: [
        NO_ERRORS_SCHEMA,
    ],
    entryComponents: [
      ItemComponent,
    ],
})
export class HomeModule { }
