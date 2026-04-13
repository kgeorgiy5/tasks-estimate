import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  ErrorIds,
  getWorkflowSchema,
  listWorkflowSchema,
  ManageWorkflowDto,
} from "@tasks-estimate/shared";
import { PROJECT_MODEL_TOKEN, Project } from "../../models";
import {
  WORKFLOW_MARKETPLACE_MODEL,
  WORKFLOW_MODEL_TOKEN,
  MarketplaceWorkflow,
  Workflow,
} from "./models";

@Injectable()
export class WorkflowsService {
  constructor(
    @InjectModel(WORKFLOW_MODEL_TOKEN)
    private readonly workflowModel: Model<Workflow>,
    @InjectModel(PROJECT_MODEL_TOKEN)
    private readonly projectModel: Model<Project>,
    @InjectModel(WORKFLOW_MARKETPLACE_MODEL)
    private readonly workflowMarketplaceModel: Model<MarketplaceWorkflow>,
  ) {}

  public async initializeWorkflowMarketplace() {
    const marketplaceWorkflows = [
      {
        domain: "personal",
        title: "personal planning",
        description:
          "Organizing personal priorities, routines, and commitments.",
        categories: [
          "annual goals",
          "quarterly goals",
          "monthly goals",
          "weekly goals",
          "daily planning",
          "priority setting",
          "time blocking",
          "calendar review",
          "appointment planning",
          "deadline tracking",
          "habit setup",
          "habit review",
          "routine design",
          "routine optimization",
          "personal kanban",
          "task batching",
          "focus sessions",
          "deep work",
          "break planning",
          "energy planning",
          "morning routine",
          "evening routine",
          "weekend planning",
          "travel planning",
          "packing plans",
          "event planning",
          "birthday planning",
          "family planning",
          "relationship checkins",
          "personal journaling",
          "reflection sessions",
          "decision logs",
          "idea capture",
          "personal research",
          "reading list",
          "course planning",
          "skill roadmap",
          "budget planning",
          "savings planning",
          "expense review",
          "bill schedule",
          "subscription review",
          "document organization",
          "inbox zero",
          "follow up tracking",
          "call planning",
          "message planning",
          "errands planning",
          "shopping plans",
          "contingency planning",
        ],
      },
      {
        domain: "personal",
        title: "home management",
        description:
          "Household upkeep, logistics, and recurring non-work operations.",
        categories: [
          "home cleaning",
          "deep cleaning",
          "laundry",
          "dishwashing",
          "trash and recycling",
          "decluttering",
          "organizing storage",
          "pantry organization",
          "grocery inventory",
          "grocery shopping",
          "meal planning",
          "meal prep",
          "cooking",
          "kitchen maintenance",
          "appliance maintenance",
          "hvac maintenance",
          "plumbing checks",
          "electrical checks",
          "safety checks",
          "home repairs",
          "contractor coordination",
          "service appointments",
          "pest control",
          "garden care",
          "lawn care",
          "plant care",
          "pet care logistics",
          "household budgeting",
          "utility tracking",
          "utility payments",
          "mortgage or rent",
          "insurance management",
          "warranty tracking",
          "furniture maintenance",
          "home office setup",
          "moving preparation",
          "room redesign",
          "seasonal maintenance",
          "winter preparation",
          "summer preparation",
          "emergency kit",
          "household paperwork",
          "document filing",
          "package management",
          "donation management",
          "recycling drops",
          "chore scheduling",
          "chore delegation",
          "inventory restock",
          "home automation",
        ],
      },
      {
        domain: "personal",
        title: "health and wellbeing",
        description:
          "Physical and mental wellbeing activities and improvements.",
        categories: [
          "workout planning",
          "strength training",
          "cardio sessions",
          "mobility training",
          "stretching",
          "yoga practice",
          "pilates practice",
          "running training",
          "cycling training",
          "sports training",
          "recovery sessions",
          "rest day planning",
          "sleep routine",
          "sleep tracking",
          "hydration tracking",
          "nutrition planning",
          "calorie planning",
          "macro tracking",
          "meal quality review",
          "supplement planning",
          "medical appointments",
          "preventive screenings",
          "medication tracking",
          "symptom tracking",
          "physiotherapy exercises",
          "posture correction",
          "breathing exercises",
          "meditation",
          "mindfulness practice",
          "stress management",
          "anxiety management",
          "mental health journaling",
          "therapy homework",
          "digital detox",
          "outdoor time",
          "sunlight exposure",
          "step goals",
          "weight tracking",
          "body metrics",
          "habit accountability",
          "addiction reduction",
          "ergonomic adjustments",
          "eye care breaks",
          "dental care",
          "skin care routine",
          "chronic condition management",
          "health education",
          "community support",
          "wellbeing retrospectives",
          "motivation planning",
        ],
      },
      {
        domain: "software development",
        title: "backend",
        description:
          "Server-side architecture and implementation for APIs and services.",
        categories: [
          "requirements analysis",
          "domain modeling",
          "api contract design",
          "rest endpoint design",
          "graphql schema design",
          "rpc interface design",
          "authentication flow",
          "authorization rules",
          "role permissions",
          "input validation",
          "serialization mapping",
          "business logic implementation",
          "service layer design",
          "repository layer",
          "database schema design",
          "migration scripts",
          "query optimization",
          "indexing strategy",
          "caching strategy",
          "background jobs",
          "queue processing",
          "event driven workflows",
          "message broker integration",
          "third party integrations",
          "webhook handling",
          "file storage integration",
          "payment integration",
          "email service integration",
          "audit logging",
          "observability hooks",
          "error handling",
          "retry and idempotency",
          "rate limiting",
          "feature flags",
          "config management",
          "secret management",
          "api versioning",
          "backward compatibility",
          "unit testing",
          "integration testing",
          "contract testing",
          "load testing",
          "performance profiling",
          "security review",
          "vulnerability patching",
          "refactoring",
          "technical debt cleanup",
          "bug triage",
          "bug fixing",
          "code review updates",
        ],
      },
      {
        domain: "software development",
        title: "frontend",
        description:
          "Client-side implementation focused on UX, UI, and interaction.",
        categories: [
          "product requirement review",
          "ux flow mapping",
          "information architecture",
          "wireframe implementation",
          "design system alignment",
          "component architecture",
          "reusable components",
          "page layout",
          "routing setup",
          "state modeling",
          "state management",
          "form implementation",
          "form validation",
          "data fetching",
          "query caching",
          "optimistic updates",
          "loading states",
          "empty states",
          "error states",
          "accessibility semantics",
          "keyboard navigation",
          "screen reader support",
          "responsive design",
          "mobile optimization",
          "tablet optimization",
          "desktop optimization",
          "theming support",
          "typography tuning",
          "iconography updates",
          "animation implementation",
          "micro interaction polish",
          "performance optimization",
          "bundle size reduction",
          "code splitting",
          "image optimization",
          "seo metadata",
          "internationalization",
          "localization qa",
          "unit testing",
          "component testing",
          "end to end testing",
          "visual regression",
          "cross browser testing",
          "bug reproduction",
          "bug fixing",
          "refactoring",
          "analytics tracking",
          "consent handling",
          "release hardening",
          "code review updates",
        ],
      },
      {
        domain: "software development",
        title: "full-stack",
        description:
          "End-to-end feature delivery across frontend and backend layers.",
        categories: [
          "feature discovery",
          "technical scoping",
          "architecture decisions",
          "api and ui contract",
          "db schema and ui model",
          "endpoint implementation",
          "frontend integration",
          "auth end to end",
          "permission enforcement",
          "validation end to end",
          "file upload flow",
          "payment flow",
          "notification flow",
          "search flow",
          "filtering and sorting",
          "pagination flow",
          "transaction handling",
          "consistency checks",
          "migration rollout",
          "seed data updates",
          "telemetry integration",
          "logging end to end",
          "tracing end to end",
          "monitoring dashboards",
          "alert definitions",
          "error budget tracking",
          "performance baseline",
          "latency optimization",
          "throughput optimization",
          "caching end to end",
          "ci pipeline updates",
          "preview environment",
          "qa handoff",
          "acceptance testing",
          "regression testing",
          "staging validation",
          "release planning",
          "rollout strategy",
          "feature flag rollout",
          "rollback planning",
          "post release checks",
          "bug triage",
          "hotfix delivery",
          "documentation updates",
          "runbook updates",
          "refactoring",
          "technical debt cleanup",
          "stakeholder demo",
          "retrospective action items",
          "code review updates",
        ],
      },
      {
        domain: "software development",
        title: "devops",
        description:
          "Infrastructure, delivery pipelines, observability, and operations.",
        categories: [
          "infrastructure design",
          "infrastructure as code",
          "terraform modules",
          "cloud networking",
          "vpc and subnet setup",
          "dns management",
          "tls certificate management",
          "load balancer config",
          "containerization",
          "image hardening",
          "kubernetes manifests",
          "helm chart updates",
          "cluster provisioning",
          "autoscaling rules",
          "secrets management",
          "config management",
          "ci pipeline design",
          "ci pipeline maintenance",
          "cd pipeline design",
          "cd pipeline maintenance",
          "build cache optimization",
          "artifact management",
          "environment promotion",
          "release orchestration",
          "blue green deployment",
          "canary deployment",
          "rollback automation",
          "database backup",
          "disaster recovery",
          "observability stack",
          "metrics instrumentation",
          "log aggregation",
          "distributed tracing",
          "alert tuning",
          "on call rotation",
          "incident response",
          "postmortem analysis",
          "sla and slo tracking",
          "security scanning",
          "dependency patching",
          "runtime hardening",
          "access control",
          "iam policy review",
          "cost optimization",
          "capacity planning",
          "compliance checks",
          "runbook maintenance",
          "platform documentation",
          "developer enablement",
          "toil reduction",
        ],
      },
    ];

    const existing = await this.workflowMarketplaceModel.find().lean();

    const toInsert = marketplaceWorkflows.filter(
      (mw) =>
        !existing.some(
          (ew) =>
            ew.domain === mw.domain &&
            ew.title === mw.title &&
            ew.description === mw.description &&
            ew.categories.length === mw.categories.length &&
            ew.categories.every((cat) => mw.categories.includes(cat)),
        ),
    );

    if (toInsert.length > 0) {
      await this.workflowMarketplaceModel.insertMany(toInsert);
    }
  }

  public async listMarketplaceWorkflows() {
    const workflows = await this.workflowMarketplaceModel.find().lean();
    return listWorkflowSchema.parse(workflows);
  }

  /**
   * Creates a workflow scoped to the authenticated user and project.
   */
  public async createWorkflow(
    userId: Types.ObjectId,
    payload: ManageWorkflowDto,
  ) {
    await this.ensureProjectExists(
      new Types.ObjectId(payload.projectId),
      userId,
    );

    const created = await this.workflowModel.create({
      userId,
      projectId: payload.projectId,
      domain: payload.domain,
      title: payload.title,
      description: payload.description,
      categories: payload.categories,
    });

    return getWorkflowSchema.parse(created.toObject());
  }

  /**
   * Updates a workflow owned by the authenticated user.
   */
  public async editWorkflow(
    workflowId: Types.ObjectId,
    userId: Types.ObjectId,
    payload: ManageWorkflowDto,
  ) {
    await this.ensureProjectExists(
      new Types.ObjectId(payload.projectId),
      userId,
    );

    const updated = await this.workflowModel
      .findOneAndUpdate(
        { _id: workflowId, userId },
        {
          $set: {
            projectId: payload.projectId,
            domain: payload.domain,
            title: payload.title,
            description: payload.description,
            categories: payload.categories,
          },
        },
        { new: true },
      )
      .lean();

    if (!updated) {
      throw new NotFoundException(ErrorIds.RESOURCE_NOT_FOUND);
    }

    return getWorkflowSchema.parse(updated);
  }

  /**
   * Deletes a workflow if it belongs to the authenticated user.
   */
  public async deleteWorkflow(
    workflowId: Types.ObjectId,
    userId: Types.ObjectId,
  ) {
    const result = await this.workflowModel
      .deleteOne({ _id: workflowId, userId })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(ErrorIds.RESOURCE_NOT_FOUND);
    }
  }

  /**
   * Lists user workflows filtered by project.
   */
  public async listWorkflows(
    userId: Types.ObjectId,
    projectId: Types.ObjectId,
  ) {
    await this.ensureProjectExists(projectId, userId);

    const workflows = await this.workflowModel
      .find({ userId, projectId })
      .lean();

    return listWorkflowSchema.parse(workflows);
  }

  /**
   * Ensures project exists and is owned by the authenticated user.
   */
  private async ensureProjectExists(
    projectId: Types.ObjectId,
    userId: Types.ObjectId,
  ) {
    const project = await this.projectModel.exists({ _id: projectId, userId });
    if (!project) {
      throw new NotFoundException(ErrorIds.RESOURCE_NOT_FOUND);
    }
  }
}
