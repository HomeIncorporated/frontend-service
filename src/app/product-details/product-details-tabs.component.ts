/*
 * Copyright 2020
 * SRDC - Software Research & Development Consultancy; Ankara; Turkey
   In collaboration with
 * SRFG - Salzburg Research Forschungsgesellschaft mbH; Salzburg; Austria
   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at
       http://www.apache.org/licenses/LICENSE-2.0
   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
 */

import { Component, Input, OnInit, EventEmitter, Output } from "@angular/core";
import { ProductDetailsTab } from "./model/product-details-tab";
import { ProductWrapper } from "../common/product-wrapper";
import { BPEService } from "../bpe/bpe.service";
import { ItemProperty } from "../catalogue/model/publish/item-property";
import { getPropertyValuesAsStrings, selectPartyName } from "../common/utils";
import { CompanySettings } from "../user-mgmt/model/company-settings";
import * as myGlobals from '../globals';
import { Quantity } from '../catalogue/model/publish/quantity';
import { TranslateService } from '@ngx-translate/core';
import { Item } from "../catalogue/model/publish/item";
import { CatalogueLine } from '../catalogue/model/publish/catalogue-line';

@Component({
    selector: 'product-details-tabs',
    templateUrl: './product-details-tabs.component.html',
    styleUrls: ['./product-details-tabs.component.css']
})
export class ProductDetailsTabsComponent implements OnInit {

    @Input() wrapper: ProductWrapper;
    // @Input() options: BpWorkflowOptions;
    @Input() itemWithSelectedProps: Item;
    @Input() associatedProducts: CatalogueLine[];
    @Input() settings: CompanySettings;

    @Input() showOverview: boolean = false;
    @Input() readonly: boolean = false;
    // whether the item is deleted or not
    // if it's deleted PRICE and DELIVERY_TRADING tabs are not shown to the user since it's not possible to retrieve those information anymore
    @Input() isCatalogueLineDeleted: boolean = false;

    @Input()
    set tabToOpen(tab: ProductDetailsTab) {
        if (tab)
            this.selectedTab = tab;
        this.tabStatus.emit(false);
    }

    @Output() tabStatus = new EventEmitter<boolean>();

    config = myGlobals.config;

    selectedTab: ProductDetailsTab;

    isLogistics: boolean = false;
    isTransportService: boolean = false;

    haveDetails = true;
    haveTransportServiceDetails = true;
    haveCertificates = true;
    haveLCPA = true;
    havePrice = true;
    haveRating = false;

    constructor(
        private translate: TranslateService,
        private bpeService: BPEService,
    ) { }

    ngOnInit() {
        this.selectedTab = this.getFirstTab();
        this.isLogistics = this.wrapper.getLogisticsStatus();
        this.isTransportService = this.wrapper.isTransportService();
        if (this.wrapper.getDimensions().length == 0 && this.wrapper.getUniquePropertiesWithValue().length == 0 && this.wrapper.getAdditionalDocuments().length == 0) {
            this.haveDetails = false;
            this.selectedTab = this.getFirstTab();
        }
        if (!this.isLogistics) {
            if (this.wrapper.getIncoterms() == '' && this.wrapper.getSpecialTerms() == null && this.wrapper.getDeliveryPeriod() == '' && this.wrapper.getPackaging() == '') {
                this.haveTransportServiceDetails = false;
                this.selectedTab = this.getFirstTab();
            }
        }
        else if (this.isTransportService) {
            if (this.wrapper.line.goodsItem.item.transportationServiceDetails.transportServiceCode.name == "" &&
                this.wrapper.line.goodsItem.item.transportationServiceDetails.supportedCommodityClassification[0].natureCode.name == "" &&
                this.wrapper.line.goodsItem.item.transportationServiceDetails.supportedCommodityClassification[0].cargoTypeCode.name == "" &&
                this.wrapper.line.goodsItem.item.transportationServiceDetails.totalCapacityDimension.measure.value == null &&
                this.wrapper.line.goodsItem.item.transportationServiceDetails.estimatedDurationPeriod.durationMeasure.value == null &&
                this.wrapper.line.goodsItem.item.transportationServiceDetails.scheduledServiceFrequency[0].weekDayCode.name == "" &&
                this.wrapper.line.goodsItem.item.transportationServiceDetails.shipmentStage[0].transportModeCode.name == "" &&
                selectPartyName(this.wrapper.line.goodsItem.item.transportationServiceDetails.shipmentStage[0].carrierParty.partyName) == null &&
                (this.wrapper.line.requiredItemLocationQuantity.applicableTerritoryAddress == null || this.wrapper.line.requiredItemLocationQuantity.applicableTerritoryAddress == [] || this.wrapper.line.requiredItemLocationQuantity.applicableTerritoryAddress == undefined) &&
                this.wrapper.line.goodsItem.item.transportationServiceDetails.shipmentStage[0].transportMeans.transportMeansTypeCode.name == "" &&
                this.wrapper.line.goodsItem.item.transportationServiceDetails.shipmentStage[0].transportMeans.transportEquipment[0].humidityPercent == null &&
                this.wrapper.line.goodsItem.item.transportationServiceDetails.shipmentStage[0].transportMeans.transportEquipment[0].refrigeratedIndicator == null &&
                this.wrapper.line.goodsItem.item.transportationServiceDetails.shipmentStage[0].transportMeans.transportEquipment[0].characteristics == null &&
                this.wrapper.line.goodsItem.item.transportationServiceDetails.shipmentStage[0].transportMeans.transportEquipment[0].transportEquipmentTypeCode.name == "" &&
                this.wrapper.line.goodsItem.item.transportationServiceDetails.environmentalEmission[0].environmentalEmissionTypeCode.name == "" &&
                this.wrapper.line.goodsItem.item.transportationServiceDetails.environmentalEmission[0].valueMeasure.value == null) {
                this.haveTransportServiceDetails = false;
                this.selectedTab = this.getFirstTab();
            }
        }

        if (this.wrapper.getPricePerItem() == '' && this.wrapper.getFreeSample() == '') {
            this.havePrice = false;
            this.selectedTab = this.getFirstTab();
        }

        if (this.settings.certificates.length == 0 && this.wrapper.line.goodsItem.item.certificate.length == 0) {
            this.haveCertificates = false;
            this.selectedTab = this.getFirstTab();
        }
        if (this.wrapper.line.goodsItem.item.lifeCyclePerformanceAssessmentDetails == null) {
            this.haveLCPA = false;
            this.selectedTab = this.getFirstTab();
        }

        this.bpeService.getRatingsSummary(this.settings.companyID, this.settings.negotiationSettings.company.federationInstanceID).then(ratings => {
            if (ratings.totalNumberOfRatings <= 0) {
                this.haveRating = false;
                this.selectedTab = this.getFirstTab();
            }
            else {
                this.haveRating = true;
            }
        })
            .catch(error => {
                this.haveRating = false;
                this.selectedTab = this.getFirstTab();
            });

    }

    onSelectTab(event: any, id: any): void {
        event.preventDefault();
        this.selectedTab = id;
        this.tabStatus.emit(false);
    }

    setTab(data) {
        if (data) {
            this.selectedTab = "COMPANY";
            this.tabStatus.emit(false);
        }
    }

    getValuesAsString(property: ItemProperty): string[] {
        return getPropertyValuesAsStrings(property);
    }

    getMultiValuedDimensionAsString(quantities: Quantity[]) {
        let quantitiesWithUnits = quantities.filter(qty => qty.unitCode && qty.unitCode != '');
        return quantitiesWithUnits.map(qty => `${qty.value} ${qty.unitCode}`).join(", ");
    }

    getHumanReadablePropertyName(propertyName: string): string {
        return propertyName.replace("Has", "");
    }

    getTransportStatusTab(data) {
        if (data) {
            this.haveTransportServiceDetails = false;
            if (this.selectedTab == "DELIVERY_TRADING")
                this.selectedTab = this.getFirstTab();
        }
    }

    getCertificateStatusTab(data) {
        if (data) {
            this.haveCertificates = false;
            if (this.selectedTab == "CERTIFICATES")
                this.selectedTab = this.getFirstTab();
        }
    }

    getLCPAStatusTab(data) {
        if (data) {
            this.haveLCPA = false;
            if (this.selectedTab == "LCPA")
                this.selectedTab = this.getFirstTab();
        }
    }

    getRatingStatusTab(data) {
        if (data) {
            this.haveRating = false;
            if (this.selectedTab == "RATING")
                this.selectedTab = this.getFirstTab();
        }
    }

    getFirstTab(): ProductDetailsTab {
        this.tabStatus.emit(false);
        if (this.tabToOpen) {
            return this.tabToOpen;
        }
        if (this.showOverview) {
            return "OVERVIEW";
        }
        else {
            if (this.haveDetails)
                return "DETAILS";
            else if (this.havePrice)
                return "PRICE";
            else if (this.haveTransportServiceDetails)
                return "DELIVERY_TRADING";
            else if (this.haveCertificates)
                return "CERTIFICATES";
            else if (this.config.showLCPA && this.haveLCPA)
                return "LCPA";
            else
                return "COMPANY";
        }
    }
}
