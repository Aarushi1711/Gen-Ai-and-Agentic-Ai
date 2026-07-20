# Software Architecture Patterns

## Monolithic Architecture
A single deployable unit containing all application logic. Best for small teams,
MVPs, hackathons, and projects with tight timelines (under 1 month). Easy to
develop, test, and deploy. Downsides: harder to scale individual components,
becomes unwieldy as the codebase grows.

Recommended for: Hackathon projects, learning projects, MVPs, solo developers,
timelines under 4 weeks.

## Microservices Architecture
Application split into independent, deployable services communicating over
APIs (usually REST or gRPC). Each service owns its own data and can be scaled
independently. Requires more infrastructure knowledge: service discovery,
API gateways, inter-service communication, distributed logging.

Recommended for: Final year projects aiming for placement/industry relevance,
projects with 3+ months timeline, teams of 3+ people, research projects
demonstrating scalability.

## Layered (N-Tier) Architecture
Separates code into presentation, business logic, and data access layers.
Simple to understand and a good default for most CRUD-style applications
regardless of team size.

Recommended for: Most general-purpose applications, especially when the team
is still learning software design.

## Event-Driven Architecture
Components communicate through events/messages rather than direct calls
(e.g., using message queues like RabbitMQ or Kafka). Useful when parts of
a system need to react to changes asynchronously.

Recommended for: Systems with real-time updates, notification systems,
projects specifically demonstrating distributed systems knowledge.