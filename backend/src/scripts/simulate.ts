import { db } from "../prisma/db.ts";

const BASE_URL = "https://the-community-s-to-do.seenode.app/api";

// Optimized helper for HTTP requests with simulated auth headers
async function apiRequest(
  endpoint: string,
  method = "GET",
  body?: any,
  userHeaders?: { id: string; role: string; status?: string },
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (userHeaders) {
    headers["x-user-id"] = userHeaders.id;
    headers["x-user-role"] = userHeaders.role;
    headers["x-user-status"] = userHeaders.status || "ACTIVE";
  }
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  console.log(response);

  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      `[API Error ${response.status}] ${data.error || JSON.stringify(data)}`,
    );
  }
  return data;
}

async function runFullSimulation() {
  console.log("==========================================================");
  console.log("🧹 CLEANING DATABASE FOR INTEGRAL SIMULATION (STEROIDS)...");
  console.log("==========================================================\n");

  // Cleanup in strict order of foreign key dependencies
  await db.orm.public.TaskVote.where({}).deleteAll();
  await db.orm.public.Task.where({}).deleteAll();
  await db.orm.public.ZoneOfAction.where({}).deleteAll();
  await db.orm.public.Post.where({}).deleteAll();
  await db.orm.public.Board.where({}).deleteAll();
  await db.orm.public.Report.where({}).deleteAll();
  await db.orm.public.User.where({}).deleteAll();
  await db.orm.public.CommunityLayout.where({}).deleteAll();
  await db.orm.public.Apartment.where({}).deleteAll();
  await db.orm.public.Tower.where({}).deleteAll();
  await db.orm.public.SubNig.where({}).deleteAll();

  console.log("✨ Database clean. Executing HTTP test battery...\n");

  try {
    // -------------------------------------------------------------------------
    // STEP 1: ADMIN AND TERRITORIAL STRUCTURES (SubNigs & Towers)
    // -------------------------------------------------------------------------
    const uAdmin = await apiRequest("/users", "POST", {
      fullName: "Linus Tolvards",
      nickname: "Tux's Dad",
      phoneNumber: "+8095550001",
      email: "tolvards@tctd.org",
      password: "qwertyuiop",
      role: "L_NIG",
      apartmentGuide: "Central Administration, The Open Source Office",
    });
    console.log("📌 [STEP 1] Configuring Territorial Structures...");
    const adminHeader = {
      id: uAdmin.id,
      role: uAdmin.role,
      status: uAdmin.status,
    };

    const subNigAlpha = await apiRequest(
      "/structures/S_NIG",
      "POST",
      { name: "SubNig Alpha (Caribbean Silicon Valley Sector)" },
      adminHeader,
    );

    const towerA1 = await apiRequest(
      "/structures/TOWER",
      "POST",
      { name: "Crossover Tower A1", subNigId: subNigAlpha.id },
      adminHeader,
    );

    const towerB2 = await apiRequest(
      "/structures/TOWER",
      "POST",
      { name: "Innovation Tower B2", subNigId: subNigAlpha.id },
      adminHeader,
    );

    console.log(`  ✅ SubNig Created: ${subNigAlpha.name} [ID: ${subNigAlpha.id}]`);
    console.log(`  ✅ Tower A1 Created: ${towerA1.name} [ID: ${towerA1.id}]`);
    console.log(`  ✅ Tower B2 Created: ${towerB2.name} [ID: ${towerB2.id}]\n`);

    // -------------------------------------------------------------------------
    // STEP 2: APARTMENTS (TOWER A1 - Layout Row: apt, GAP, apt)
    // -------------------------------------------------------------------------
    console.log("📌 [STEP 2] Creating Apartments in the Towers...");
    const apt501 = await apiRequest("/apartments", "POST", { towerId: towerA1.id, name: "Apartment 501" }, adminHeader);
    const apt502 = await apiRequest("/apartments", "POST", { towerId: towerA1.id, name: "Apartment 502" }, adminHeader);
    const apt401 = await apiRequest("/apartments", "POST", { towerId: towerA1.id, name: "Apartment 401" }, adminHeader);
    const apt402 = await apiRequest("/apartments", "POST", { towerId: towerA1.id, name: "Apartment 402" }, adminHeader);
    const apt301 = await apiRequest("/apartments", "POST", { towerId: towerA1.id, name: "Apartment 301" }, adminHeader);
    const apt302 = await apiRequest("/apartments", "POST", { towerId: towerA1.id, name: "Apartment 302" }, adminHeader);
    const apt201 = await apiRequest("/apartments", "POST", { towerId: towerA1.id, name: "Apartment 201" }, adminHeader);
    const apt202 = await apiRequest("/apartments", "POST", { towerId: towerA1.id, name: "Apartment 202" }, adminHeader);
    const apt101 = await apiRequest("/apartments", "POST", { towerId: towerA1.id, name: "Apartment 101" }, adminHeader);
    const apt102 = await apiRequest("/apartments", "POST", { towerId: towerA1.id, name: "Apartment 102" }, adminHeader);

    console.log(`  ✅ Tower A1 apartments successfully created.\n`);

    // -------------------------------------------------------------------------
    // STEP 3: USER REGISTRATION (The Legendary Crossover + New Guests)
    // -------------------------------------------------------------------------
    console.log("📌 [STEP 3] Registering the Supreme Creator, Tech Legends, and Gregorz...");

    const uAustin = await apiRequest(
      "/users",
      "POST",
      {
        fullName: "Austin Valdez",
        nickname: "AmirCode26",
        phoneNumber: "+8094630988",
        email: "austin@amircode26.dev",
        password: "qwertyuiop",
        role: "L_NIG",
        apartmentId: apt501.id,
        apartmentGuide: "I live in apartment 501 of Crossover Tower A1 (The Architect's Penthouse)",
      },
      adminHeader,
    );

    const uJobs = await apiRequest(
      "/users",
      "POST",
      {
        fullName: "Steve Jobs",
        nickname: "iSteve",
        phoneNumber: "+8095551984",
        email: "steve@apple.com",
        password: "qwertyuiop",
        role: "I_T",
        apartmentId: apt401.id,
        apartmentGuide: "I live in apartment 401 of Crossover Tower A1",
      },
      adminHeader,
    );

    const uElon = await apiRequest(
      "/users",
      "POST",
      {
        fullName: "Elon Musk",
        nickname: "X_Musk",
        phoneNumber: "+8095552026",
        email: "elon@x.com",
        password: "qwertyuiop",
        role: "I_T",
        apartmentId: apt402.id,
        apartmentGuide: "I live in apartment 402 of Crossover Tower A1",
      },
      adminHeader,
    );

    const uGates = await apiRequest(
      "/users",
      "POST",
      {
        fullName: "Bill Gates",
        nickname: "Windows98",
        phoneNumber: "+8095551955",
        email: "bill@gatesfoundation.org",
        password: "qwertyuiop",
        role: "I_T",
        apartmentId: apt301.id,
        apartmentGuide: "I live in apartment 301 of Crossover Tower A1",
      },
      adminHeader,
    );

    const uSam = await apiRequest(
      "/users",
      "POST",
      {
        fullName: "Sam Altman",
        nickname: "GPT_Sam",
        phoneNumber: "+8095552023",
        email: "sam@openai.com",
        password: "qwertyuiop",
        role: "I_T",
        apartmentId: apt302.id,
        apartmentGuide: "I live in apartment 302 of Crossover Tower A1",
      },
      adminHeader,
    );

    const uNvidia = await apiRequest(
      "/users",
      "POST",
      {
        fullName: "Jensen Huang",
        nickname: "Best RTX",
        phoneNumber: "+8095551993",
        email: "jensen@nvidia.com",
        password: "qwertyuiop",
        role: "I_T",
        apartmentId: apt201.id,
        apartmentGuide: "I live in apartment 201 of Crossover Tower A1 (Leather Jacket Wardrobe)",
      },
      adminHeader,
    );

    const uBezos = await apiRequest(
      "/users",
      "POST",
      {
        fullName: "Jeff Bezos",
        nickname: "PrimeDelivery",
        phoneNumber: "+8095551994",
        email: "jeff@amazon.com",
        password: "qwertyuiop",
        role: "I_T",
        apartmentId: apt202.id,
        apartmentGuide: "I live in apartment 202 of Crossover Tower A1",
      },
      adminHeader,
    );

    const uLarry = await apiRequest(
      "/users",
      "POST",
      {
        fullName: "Larry Page",
        nickname: "GoogleSearch",
        phoneNumber: "+8095551998",
        email: "larry@page.com",
        password: "qwertyuiop",
        role: "L_SNIG",
        apartmentId: apt101.id,
        apartmentGuide: "I live in apartment 101 of Crossover Tower A1",
      },
      adminHeader,
    );

    const uGregorz = await apiRequest(
      "/users",
      "POST",
      {
        fullName: "Gregorz Bręczeszczekiewicz",
        nickname: "PolskiPiorun",
        phoneNumber: "+4855512345",
        email: "gregorz@chrząschczyżewoszyce.pl",
        password: "qwertyuiop",
        role: "I_T",
        apartmentId: apt102.id,
        apartmentGuide: "I live in apartment 102 of Crossover Tower A1 (Nobody knows how to pronounce my name)",
      },
      adminHeader,
    );

    console.log(`  ✅ Crossover users successfully registered.\n`);

    // -------------------------------------------------------------------------
    // STEP 4: LOGIN AND ACCOUNT APPROVAL
    // -------------------------------------------------------------------------
    console.log("📌 [STEP 4] Activating credentials for the legends...");

    const loginAustin = await apiRequest("/users/login", "POST", {
      phoneNumber: "+8094630988",
      password: "qwertyuiop",
    });
    console.log(`  🔑 AmirCode26 login successful [Role: ${loginAustin.role}]`);

    await apiRequest(`/users/${uJobs.id}/status`, "PATCH", { status: "ACTIVE" }, adminHeader);
    await apiRequest(`/users/${uElon.id}/status`, "PATCH", { status: "ACTIVE" }, adminHeader);
    await apiRequest(`/users/${uGates.id}/status`, "PATCH", { status: "ACTIVE" }, adminHeader);
    await apiRequest(`/users/${uSam.id}/status`, "PATCH", { status: "ACTIVE" }, adminHeader);
    await apiRequest(`/users/${uNvidia.id}/status`, "PATCH", { status: "ACTIVE" }, adminHeader);
    await apiRequest(`/users/${uBezos.id}/status`, "PATCH", { status: "ACTIVE" }, adminHeader);
    await apiRequest(`/users/${uGregorz.id}/status`, "PATCH", { status: "ACTIVE" }, adminHeader);
    console.log(`  🛡️ All legend accounts successfully updated to status: ACTIVE\n`);

    // -------------------------------------------------------------------------
    // STEP 5: COMMUNITY BOARD AND EPIC POSTS
    // -------------------------------------------------------------------------
    console.log("📌 [STEP 5] Publishing epic debates on the General Board...");

    const globalBoard = await apiRequest(
      "/boards",
      "POST",
      {
        title: "Tech Crossover General Board",
        type: "DISCUSSION",
        ownerStructureType: "GLOBAL",
        cooldownSeconds: 0,
      },
      adminHeader,
    );

    await apiRequest("/posts", "POST", { boardId: globalBoard.id, content: "Welcome to the Community Operating System (TC_TD). 100% custom architecture optimized by AmirCode26." }, { id: uAustin.id, role: uAustin.role, status: "ACTIVE" });
    await apiRequest("/posts", "POST", { boardId: globalBoard.id, content: "20 years ago we designed interfaces that actually mattered. This tower control panel needs fewer physical buttons and more minimalist elegance." }, { id: uJobs.id, role: uJobs.role, status: "ACTIVE" });
    await apiRequest("/posts", "POST", { boardId: globalBoard.id, content: "I propose diverting the electric gate maintenance budget to fund a SpaceX rocket to Mars in case neighbors keep making noise at 3:00 AM." }, { id: uElon.id, role: uElon.role, status: "ACTIVE" });
    await apiRequest("/posts", "POST", { boardId: globalBoard.id, content: "If everyone upgraded their apartment GPUs to our latest architecture, ray-tracing the hallway lighting would take zero latency." }, { id: uNvidia.id, role: uNvidia.role, status: "ACTIVE" });
    await apiRequest("/posts", "POST", { boardId: globalBoard.id, content: "I can have Amazon Prime deliver packages directly to anyone's balcony via drone in under 30 minutes." }, { id: uBezos.id, role: uBezos.role, status: "ACTIVE" });
    await apiRequest("/posts", "POST", { boardId: globalBoard.id, content: "Grzegorz Bręczeszczekiewicz z Chrząshczyżewoszyce powołał się na artykuł piąty regulaminu!" }, { id: uGregorz.id, role: uGregorz.role, status: "ACTIVE" });

    console.log(`  💬 Debates successfully published on the board.\n`);

    // -------------------------------------------------------------------------
    // STEP 6: ZONES OF ACTION (ZAs), TASKS, AND VOTE VARIETY
    // -------------------------------------------------------------------------
    console.log("📌 [STEP 6] Creating multiple ZAs (No votes, active votes, and resolved)...");

    // ZA 1: Fully Resolved / Closed
    const zaResolved = await apiRequest("/zas", "POST", { subNigId: subNigAlpha.id, title: "Perimeter Wi-Fi Connectivity Optimization", description: "Community fiber optic across the entire sector.", priority: 1 }, { id: uLarry.id, role: uLarry.role, status: "ACTIVE" });
    await apiRequest("/zas/status", "PATCH", { status: "COMPLETED" }, { id: uAdmin.id, role: uAdmin.role, status: "ACTIVE" }).catch(() => {});

    // ZA 2: Active Voting and Consensus in progress
    const zaVoting = await apiRequest("/zas", "POST", { subNigId: subNigAlpha.id, title: "Artificial Intelligence for Moderation", description: "Integration of advanced LLMs to mediate neighbor disputes.", priority: 2 }, { id: uLarry.id, role: uLarry.role, status: "ACTIVE" });
    const taskVoting = await apiRequest("/zas/tasks", "POST", { zaId: zaVoting.id, title: "Approve deployment of GPT_Sam moderator bot" }, { id: uLarry.id, role: uLarry.role, status: "ACTIVE" });
    await apiRequest("/zas/tasks/vote", "POST", { taskId: taskVoting.id, approved: true, comment: "Fascinating. Artificial intelligence will solve hallway gossip." }, { id: uSam.id, role: uSam.role, status: "ACTIVE" });
    await apiRequest("/zas/tasks/vote", "POST", { taskId: taskVoting.id, approved: true, comment: "Excellent initiative." }, { id: uJobs.id, role: uJobs.role, status: "ACTIVE" });

    // ZA 3: Fresh / No Votes yet
    const zaFresh = await apiRequest("/zas", "POST", { subNigId: subNigAlpha.id, title: "Community Helipad Installation", description: "Landing platform for autonomous transportation.", priority: 3 }, { id: uLarry.id, role: uLarry.role, status: "ACTIVE" });
    await apiRequest("/zas/tasks", "POST", { zaId: zaFresh.id, title: "Quote airspace permits with the municipality" }, { id: uLarry.id, role: uLarry.role, status: "ACTIVE" });

    console.log(`  ✅ Zones of Action created (Resolved, In Voting, and Fresh).\n`);

    // -------------------------------------------------------------------------
    // STEP 7: COMMUNITY LAYOUTS (EXPANDED TOWER & S_NIG WITH apt, GAP, apt)
    // -------------------------------------------------------------------------
    console.log("📌 [STEP 7] Generating expanded 2D matrix layouts...");

    // 1. Tower Layout ("TOWER" - row structure: apt, GAP, apt)
    await apiRequest(
      "/layouts",
      "POST",
      {
        structureType: "TOWER",
        structureId: towerA1.id,
        layoutJson: {
          type: "TOWER",
          id: towerA1.id,
          label: "Crossover Tower A1",
          matrix: [
            [apt501.id, "GAP", apt502.id],
            [apt401.id, "GAP", apt402.id],
            [apt301.id, "GAP", apt302.id],
            [apt201.id, "GAP", apt202.id],
            [apt101.id, "GAP", apt102.id]
          ]
        },
      },
      adminHeader,
    );

    // 2. Expanded SNIG Layout ("S_NIG")
    await apiRequest(
      "/layouts",
      "POST",
      {
        structureType: "S_NIG",
        structureId: subNigAlpha.id,
        layoutJson: {
          type: "S_NIG",
          id: subNigAlpha.id,
          label: "Caribbean Silicon Valley Sector",
          matrix: [
            [{ type: "TOWER", id: towerA1.id }, "STREET-1", "GAP", "STREET-2", { type: "ZA", id: zaResolved.id }],
            ["STREET-1", "STREET-1", "GAP", "STREET-2", "STREET-2"],
            [{ type: "TOWER", id: towerB2.id }, "STREET-3", "GAP", { type: "ZA", id: zaVoting.id }, { type: "ZA", id: zaFresh.id }],
            ["STREET-3", "STREET-3", "GAP", "STREET-3", "STREET-3"]
          ]
        },
      },
      adminHeader,
    );

    console.log(`  🗺️ Expanded Tower and S_NIG 2D layouts successfully saved.\n`);

    console.log("==========================================================");
    console.log("📊 STEROID-INFUSED SIMULATION COMPLETED WITH TOTAL SUCCESS 🚀");
    console.log("==========================================================\n");
  } catch (error: any) {
    console.error("❌ ERROR IN STEROID SIMULATION:", error.message);
  }
}

runFullSimulation();
