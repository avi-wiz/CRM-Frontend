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
import CreateOrderPage from "./pages/CreateOrderPage";
import { crmNav } from "./data/constants";

export default function App() {
  const [activeEntity, setActiveEntity] = useState("companies");
  const [activeCompanyId, setActiveCompanyId] = useState(null);
  const [activeContactId, setActiveContactId] = useState(null);
  const [activeDealId, setActiveDealId] = useState(null);
  const [activeQuoteId, setActiveQuoteId] = useState(null);
  const [pendingDuplicate, setPendingDuplicate] = useState(null); // deal to add when DealsPage next renders

  const handleEntityChange = (key) => {
    setActiveEntity(key);
    setActiveCompanyId(null);
    setActiveContactId(null);
    setActiveDealId(null);
    setActiveQuoteId(null);
  };

  const openCompany = (companyId) => {
    setActiveEntity("companies");
    setActiveContactId(null);
    setActiveDealId(null);
    setActiveQuoteId(null);
    setActiveCompanyId(companyId);
  };

  const openContact = (contactId) => {
    setActiveEntity("contacts");
    setActiveCompanyId(null);
    setActiveDealId(null);
    setActiveQuoteId(null);
    setActiveContactId(contactId);
  };

  const openDeal = (dealId) => {
    setActiveEntity("deals");
    setActiveCompanyId(null);
    setActiveContactId(null);
    setActiveQuoteId(null);
    setActiveDealId(dealId);
  };

  const openQuote = (quoteId) => {
    setActiveCompanyId(null);
    setActiveContactId(null);
    setActiveDealId(null);
    setActiveQuoteId(quoteId);
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
