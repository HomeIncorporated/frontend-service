import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { Credentials } from './model/credentials';
import { CredentialsService } from './credentials.service';
import * as myGlobals from '../globals';
import { CookieService } from 'ng2-cookies';
import { CallStatus } from '../common/call-status';
import { copy } from '../common/utils';
//declare var jsSHA: any;

@Component({
	selector: 'credentials-form',
	providers: [ CookieService ],
	templateUrl: './credentials-form.component.html'
})

export class CredentialsFormComponent implements OnInit {

	debug = myGlobals.debug;
	pwLink = myGlobals.pw_reset_link;
	model = new Credentials('','');
	objToSubmit = new Credentials('','');
	response: any;
	shaObj: any;

	submitCallStatus: CallStatus = new CallStatus();

	constructor(
		private credentialsService: CredentialsService,
		private cookieService: CookieService,
		private appComponent: AppComponent
	) {	}

	ngOnInit() {
		this.getVersions();
		if (this.cookieService.get("user_id"))
			this.appComponent.checkLogin("/dashboard");
	}

	post(credentials: Credentials): void {
		this.submitCallStatus.submit();
		this.credentialsService.post(credentials)
		.then(res => {
			if (myGlobals.debug)
				console.log(`User logged in . Response: ${JSON.stringify(res)}`);

			this.response = res;
			this.cookieService.set("user_id",res.userID);
			if (res.companyID)
				this.cookieService.set("company_id",res.companyID);
			else
				this.cookieService.set("company_id",null);
			if (res.companyName)
				this.cookieService.set("active_company_name",res.companyName);
			else
				this.cookieService.set("active_company_name",null);
			if (res.showWelcomeInfo)
				this.cookieService.set("show_welcome","true");
			else
				this.cookieService.set("show_welcome","false");
			this.cookieService.set("user_fullname",res.firstname+" "+res.lastname);
			this.cookieService.set("user_email",res.email);
			this.cookieService.set("bearer_token",res.accessToken);
			this.submitCallStatus.callback("Login Successful");
			this.appComponent.checkLogin("/dashboard");
		})
		.catch(error => {
			this.cookieService.delete("user_id");
			this.cookieService.delete("company_id");
			this.cookieService.delete("user_fullname");
			this.cookieService.delete("user_email");
			this.cookieService.delete("active_company_name");
			this.cookieService.delete("show_welcome");
			this.cookieService.delete("bearer_token");
			this.appComponent.checkLogin("");
			this.submitCallStatus.error("Invalid email or password", error);
		});
	}

	getVersions(): void {
		this.credentialsService.getVersionIdentity()
		.then(res => {
			if (res.git && res.git.branch && res.git.commit && res.git.commit.time && res.git.commit.id) {
				const date_str = new Date(res.git.commit.time).toISOString();
				this.appComponent.addVersion("identity",`${res.git.branch}-${res.git.commit.id}`,`${date_str}`);
			}
			else {
				this.appComponent.removeVersion("identity");
			}
		});
		this.credentialsService.getVersionBP()
		.then(res => {
			if (res.git && res.git.branch && res.git.commit && res.git.commit.time && res.git.commit.id) {
				const date_str = new Date(res.git.commit.time).toISOString();
				this.appComponent.addVersion("business-process",`${res.git.branch}-${res.git.commit.id}`,`${date_str}`);
			}
			else {
				this.appComponent.removeVersion("business-process");
			}
		});
		this.credentialsService.getVersionDataChannel()
		.then(res => {
			if (res.git && res.git.branch && res.git.commit && res.git.commit.time && res.git.commit.id) {
				const date_str = new Date(res.git.commit.time).toISOString();
				this.appComponent.addVersion("data-channels",`${res.git.branch}-${res.git.commit.id}`,`${date_str}`);
			}
			else {
				this.appComponent.removeVersion("data-channels");
			}
		});
	}

	reset() {
		this.submitCallStatus.reset();
		this.model = new Credentials('','');
		this.objToSubmit = new Credentials('','');
	}

	onSubmit() {
		this.objToSubmit = copy(this.model);
		/*
		this.shaObj = new jsSHA("SHA-256", "TEXT");
		this.shaObj.update(this.model.password);
        this.objToSubmit.password = this.shaObj.getHash("HEX");
		*/
		this.post(this.objToSubmit);
	}

}
