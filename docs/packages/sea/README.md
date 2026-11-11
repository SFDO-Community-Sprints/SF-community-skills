# Summit Events App

Notes for skill authors. The generated [data-model.md](data-model.md) lists every object and field in the package source.

- **Source:** https://github.com/SFDO-Community/Summit-Events-App
- **Namespace:** `summit` (skill prefix `sea`)
- **Trial org:** install into a free Developer Edition org (see [testing/salesforce-orgs.md](../../testing/salesforce-orgs.md))

The Summit Events App is an event registration system built at the University of St. Thomas. It is used by education and nonprofit orgs, often alongside EDA or NPSP.

## Key concepts

- **Event** (`summit__Summit_Events__c`): the event definition, including registration page settings, questions, fees, and emails.
- **Instance** (`summit__Summit_Events_Instance__c`): one date and time of an event. Registrations belong to an instance.
- **Registration** (`summit__Summit_Events_Registration__c`): one person's registration, with links to a Contact, Lead, or Person Account when matched.
- **Appointments** (`summit__Summit_Events_Appointments__c`) and **Appointment Types**: optional sessions a registrant can request, with an Appointment Status.
- **Fees, Fee Allocations, and Payments:** fees charged for an event or appointment, the allocations they are coded to, and payments against a registration.
- **Emails** (`summit__Summit_Events_Email__c`): automated emails sent when a registration reaches a given status.
- **Matching mappings** (custom metadata): how registrations are matched to Contacts, Leads, or Person Accounts.

## Gotchas

- Public registration pages run on a Salesforce Site with a guest user; setup is in the package documentation.
- Registration status drives automated emails, so changing a status can email the registrant.
- _TODO: more gotchas from practitioners. Contributions welcome._

## Help resources

- Documentation: https://sfdo-community-sprints.github.io/summit-events-app-documentation/
- Install: https://install.salesforce.org/products/SummitEventsApp/latest
