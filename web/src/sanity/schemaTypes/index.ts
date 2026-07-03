import type { SchemaTypeDefinition } from "sanity";

import { audiencePage } from "./audiencePage";
import { auditInquiry } from "./auditInquiry";
import { capacityRequest } from "./capacityRequest";
import { dataCenterProject } from "./dataCenterProject";
import { contactInquiry } from "./contactInquiry";
import { deal } from "./deal";
import { governor } from "./governor";
import { homeConnectivity } from "./homeConnectivity";
import { ingestionRun } from "./ingestionRun";
import { investorProfile } from "./investorProfile";
import { landSubmission } from "./landSubmission";
import { marketIntelPost } from "./marketIntelPost";
import { marketReport } from "./marketReport";
import { navigation } from "./navigation";
import { newsletterSubscriber } from "./newsletterSubscriber";
import { newsItem } from "./newsItem";
import { newsSource } from "./newsSource";
import { page } from "./page";
import { seoDefaults } from "./seoDefaults";
import { service } from "./service";
import { siteSettings } from "./siteSettings";
import { teamMember } from "./teamMember";
import { testimonial } from "./testimonial";
import { theme } from "./theme";
import { tribalProject } from "./tribalProject";
import { connectivityBrief } from "./connectivityBrief";

export const schemaTypes: SchemaTypeDefinition[] = [
  // Data infrastructure
  dataCenterProject,
  governor,
  tribalProject,
  // Lead capture
  landSubmission,
  investorProfile,
  capacityRequest,
  contactInquiry,
  auditInquiry,
  newsletterSubscriber,
  // Intelligence
  newsSource,
  newsItem,
  ingestionRun,
  marketReport,
  marketIntelPost,
  connectivityBrief,
  deal,
  // Site structure
  homeConnectivity,
  audiencePage,
  page,
  service,
  testimonial,
  teamMember,
  siteSettings,
  navigation,
  theme,
  seoDefaults,
];
