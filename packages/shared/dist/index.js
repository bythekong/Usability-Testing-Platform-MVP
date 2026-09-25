"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobStatus = exports.PaymentStatus = exports.Role = void 0;
var Role;
(function (Role) {
    Role["OWNER"] = "OWNER";
    Role["TESTER"] = "TESTER";
})(Role || (exports.Role = Role = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["FUNDED"] = "FUNDED";
    PaymentStatus["COMPLETED"] = "COMPLETED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var JobStatus;
(function (JobStatus) {
    JobStatus["AVAILABLE"] = "AVAILABLE";
    JobStatus["CLAIMED"] = "CLAIMED";
    JobStatus["SUBMITTED"] = "SUBMITTED";
    JobStatus["APPROVED"] = "APPROVED";
    JobStatus["REJECTED"] = "REJECTED";
})(JobStatus || (exports.JobStatus = JobStatus = {}));
