import { Component, Input, OnInit } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { constants } from "@noovolari/leapp-core/models/constants";

@Component({
  selector: "app-confirmation-dialog",
  templateUrl: "./confirmation-dialog.component.html",
  styleUrls: ["./confirmation-dialog.component.scss"],
})
export class ConfirmationDialogComponent implements OnInit {
  @Input()
  message: string;
  @Input()
  callback: any;

  @Input()
  confirmText: string;

  @Input()
  cancelText: string;

  /* Just a restyled modal to show a confirmation for delete actions */
  constructor(private bsModalRef: BsModalRef) {}

  ngOnInit(): void {}

  /**
   * Launch a callback on yes (which is the actual action), then close
   */
  confirm(): void {
    if (this.callback) {
      this.callback(constants.confirmed);
      this.close();
    }
  }

  close(): void {
    this.bsModalRef.hide();
    this.callback(constants.confirmClosed);
  }
}
