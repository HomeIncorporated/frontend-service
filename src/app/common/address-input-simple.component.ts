import { Component, OnInit, Input } from "@angular/core";
import { AddressSimple } from "../catalogue/model/publish/address-simple";
import { Observable } from "rxjs";
import { debounceTime, distinctUntilChanged, map } from "rxjs/operators";
import { getCountrySuggestions } from "./utils";
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: "address-input-simple",
    templateUrl: "./address-input-simple.component.html",
    styleUrls: ["./address-input-simple.component.css"]
})
export class AddressInputSimpleComponent implements OnInit {

    @Input() address: AddressSimple = new AddressSimple();
    @Input() disabled: boolean = false;
    @Input() required: boolean = false;

    constructor(private translate: TranslateService

    ) { 
      translate.setDefaultLang("en");
      translate.use(translate.getBrowserLang());
    }

    ngOnInit() {

    }

    getSuggestions = (text$: Observable<string>) =>
      text$.pipe(
        debounceTime(50),
        distinctUntilChanged(),
        map(term => getCountrySuggestions(term))
      );

}
