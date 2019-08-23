import { Component, Input } from "@angular/core";
import { CatalogueLine } from "../../model/publish/catalogue-line";
import { FormGroup } from "@angular/forms";
import { INCOTERMS } from "../../model/constants";
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'product-trading-details',
    templateUrl: './product-trading-details.component.html',
})

// Component that displays warranty information etc. inside the "trading details" tab in CatalogueLineView
export class ProductTradingDetailsComponent {
    @Input() presentationMode:string;
    @Input() catalogueLine: CatalogueLine;
    @Input() parentForm: FormGroup;

    INCOTERMS: string[] = INCOTERMS;

    constructor(
        private translate: TranslateService
    ) {
        translate.setDefaultLang("en");
        translate.use(translate.getBrowserLang());
    }
}
