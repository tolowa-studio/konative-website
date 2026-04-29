import type { SchemaTypeDefinition } from "sanity";

import { audiencePage } from "./audiencePage";
import { capacityRequest } from "./capacityRequest";
import { dataCenterProject } from "./dataCenterProject";
import { contactInquiry } from "./contactInquiry";
import { deal } from "./deal";
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

export const schemaTypes: SchemaTypeDefinition[] = [
  // Data infrastructure
  dataCenterProject,
  // Lead capture
  landSubmission,
  investorProfile,
  capacityRequest,
  contactInquiry,
  newsletterSubscriber,
  // Intelligence
  newsSource,
  newsItem,
  ingestionRun,
  marketReport,
  marketIntelPost,
  deal,
  // Site structure
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
