import { useState } from "react";
import AppShell from "./layouts/AppShell";
import CompaniesPage from "./pages/CompaniesPage";
import CompanyDetailPage from "./pages/CompanyDetailPage";
import ContactsPage from "./pages/ContactsPage";
import ContactDetailPage from "./pages/ContactDetailPage";
import DealDetailPage from "./pages/DealDetailPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import DealsPage from "./pages/DealsPage";
import QuotesPage from "./pages/QuotesPage";
import QuoteDetailPage from "./pages/QuoteDetailPage";
import MeetingsPage from "./pages/MeetingsPage";
import MeetingDetailPage from "./pages/MeetingDetailPage";
import TasksPage from "./pages/TasksPage";
import TaskDetailPage from "./pages/TaskDetailPage";
import VisitsPage from "./pages/VisitsPage";
import VisitDetailPage from "./pages/VisitDetailPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import CreateOrderPage from "./pages/CreateOrderPage";
import { crmNav } from "./data/constants";

export default function App() {
  const [activeEntity, setActiveEntity] = useState("companies");
  const [activeCompanyId, setActiveCompanyId] = useState(null);
  const [activeContactId, setActiveContactId] = useState(null);
  const [activeDealId, setActiveDealId] = useState(null);
  const [activeQuoteId, setActiveQuoteId] = useState(null);
  const [activeMeetingId, setActiveMeetingId] = useState(null);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [activeVisitId, setActiveVisitId] = useState(null);
  const [pendingDuplicate, setPendingDuplicate] = useState(null); // deal to add when DealsPage next renders

  const clearDetails = () => {
    setActiveCompanyId(null);
    setActiveContactId(null);
    setActiveDealId(null);
    setActiveQuoteId(null);
    setActiveMeetingId(null);
    setActiveTaskId(null);
    setActiveVisitId(null);
  };

  const handleEntityChange = (key) => {
    setActiveEntity(key);
    clearDetails();
  };

  const openCompany = (companyId) => {
    setActiveEntity("companies");
    clearDetails();
    setActiveCompanyId(companyId);
  };

  const openContact = (contactId) => {
    setActiveEntity("contacts");
    clearDetails();
    setActiveContactId(contactId);
  };

  const openDeal = (dealId) => {
    setActiveEntity("deals");
    clearDetails();
    setActiveDealId(dealId);
  };

  const openQuote = (quoteId) => {
    clearDetails();
    setActiveQuoteId(quoteId);
  };

  const openMeeting = (meetingId) => {
    clearDetails();
    setActiveMeetingId(meetingId);
  };

  const openTask = (taskId) => {
    clearDetails();
    setActiveTaskId(taskId);
  };

  const openVisit = (visitId) => {
    clearDetails();
    setActiveVisitId(visitId);
  };

  // Dispatch an { type, id } entity descriptor (from the Activities feed) to the
  // right detail page.
  const openEntity = (entity) => {
    if (!entity) return;
    if (entity.type === "company" || entity.type === "customer") openCompany(entity.id);
    else if (entity.type === "contact") openContact(entity.id);
    else if (entity.type === "deal") openDeal(entity.id);
  };

  const renderContent = () => {
    if (activeCompanyId != null) {
      return (
        <CompanyDetailPage
          companyId={activeCompanyId}
          onBack={() => setActiveCompanyId(null)}
          onContactClick={openContact}
          onDealClick={openDeal}
          onQuoteClick={openQuote}
          onVisitClick={openVisit}
          onTaskClick={openTask}
          onMeetingClick={openMeeting}
        />
      );
    }

    if (activeContactId != null) {
      return (
        <ContactDetailPage
          contactId={activeContactId}
          onBack={() => setActiveContactId(null)}
          onCompanyClick={openCompany}
          onDealClick={openDeal}
          onVisitClick={openVisit}
          onTaskClick={openTask}
          onMeetingClick={openMeeting}
        />
      );
    }

    if (activeDealId != null) {
      return (
        <DealDetailPage
          dealId={activeDealId}
          onBack={() => setActiveDealId(null)}
          onCompanyClick={openCompany}
          onContactClick={openContact}
          onVisitClick={openVisit}
          onTaskClick={openTask}
          onMeetingClick={openMeeting}
          onDuplicate={(deal) => {
            setPendingDuplicate(deal);
            setActiveDealId(null); // navigate back to deals list
          }}
        />
      );
    }

    if (activeQuoteId != null) {
      return (
        <QuoteDetailPage
          quoteId={activeQuoteId}
          onBack={() => setActiveQuoteId(null)}
          onCompanyClick={openCompany}
          onOpenQuote={openQuote}
        />
      );
    }

    if (activeMeetingId != null) {
      return (
        <MeetingDetailPage
          meetingId={activeMeetingId}
          onBack={() => setActiveMeetingId(null)}
          onCompanyClick={openCompany}
          onContactClick={openContact}
          onDealClick={openDeal}
        />
      );
    }

    if (activeTaskId != null) {
      return (
        <TaskDetailPage
          taskId={activeTaskId}
          onBack={() => setActiveTaskId(null)}
          onCompanyClick={openCompany}
          onContactClick={openContact}
          onDealClick={openDeal}
          onMeetingClick={openMeeting}
          onTaskClick={openTask}
        />
      );
    }

    if (activeVisitId != null) {
      return (
        <VisitDetailPage
          visitId={activeVisitId}
          onBack={() => setActiveVisitId(null)}
          onCompanyClick={openCompany}
          onContactClick={openContact}
          onVisitClick={openVisit}
        />
      );
    }

    switch (activeEntity) {
      case "companies":
      case "customers":
        return (
          <CompaniesPage
            customerFilter={activeEntity === "customers"}
            onRowClick={(row) => setActiveCompanyId(row.id)}
          />
        );

      case "contacts":
        return (
          <ContactsPage
            onCompanyClick={openCompany}
            onContactClick={(contactId) => setActiveContactId(contactId)}
          />
        );

      case "deals":
        return (
          <DealsPage
            onDealClick={(row) => setActiveDealId(row.id)}
            pendingDuplicate={pendingDuplicate}
            onDuplicateConsumed={() => setPendingDuplicate(null)}
          />
        );

      case "quotes":
        return <QuotesPage onQuoteClick={(id) => setActiveQuoteId(id)} />;

      case "meetings":
        return <MeetingsPage onMeetingClick={openMeeting} onCompanyClick={openCompany} />;

      case "tasks":
        return <TasksPage onTaskClick={openTask} onCompanyClick={openCompany} />;

      case "visits":
        return <VisitsPage onVisitClick={openVisit} onCompanyClick={openCompany} />;

      case "activities":
        return <ActivitiesPage onEntityClick={openEntity} />;

      case "orders":
        return <CreateOrderPage onBack={() => handleEntityChange("companies")} />;

      // Meetings, Tasks, Visits, Activities, Dashboard aren't built yet —
      // route them to PlaceholderPage, passing the nav label so it renders
      // "<Label> — Coming Soon".
      default: {
        const navItem = crmNav.find((n) => n.key === activeEntity);
        return <PlaceholderPage entity={navItem?.label ?? activeEntity} />;
      }
    }
  };

  return (
    <AppShell activeEntity={activeEntity} onEntityChange={handleEntityChange}>
      {renderContent()}
    </AppShell>
  );
}
