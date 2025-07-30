import {
	ClinicianInitialsButton,
	Header as VACDSHeader,
} from "@department-of-veterans-affairs/clinical-design-system";

const SAMPLE_PATIENT = {
	firstName: "John",
	lastName: "Doe",
	ssn: "6789",
};

export function Header() {
	return (
		<VACDSHeader appName="VA | AI assist" patientContextProps={SAMPLE_PATIENT}>
			<ClinicianInitialsButton
				ariaLabel="User menu for VA.NPUser1@example.com"
				initials="VU"
			/>
		</VACDSHeader>
	);
}
