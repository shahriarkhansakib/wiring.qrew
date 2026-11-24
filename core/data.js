/**
 * Qrew - Data Layer & State Management (localStorage backed)
 * Hierarchical Multi-Tenant Access Control: Platform -> Tenants -> Offices -> Office Members
 */

const STORAGE_KEY = 'qrew_platform_state_v5';

const DEFAULT_DATA = {
  currentUser: {
    id: 'usr_sakib',
    name: 'Sakib',
    email: 'sakib@qrew.io',
    platformRole: 'Platform Owner',
    avatar: 'S'
  },
  users: [
    { id: 'usr_sakib', name: 'Sakib', email: 'sakib@qrew.io', platformRole: 'Platform Owner', status: 'Active', createdAt: '2026-08-01' },
    { id: 'usr_mina', name: 'Mina Chowdhury', email: 'mina@qrew.io', platformRole: 'Platform Admin', status: 'Active', createdAt: '2026-08-15' },
    { id: 'usr_jack', name: 'Jack Rahman', email: 'jack@qrew.io', platformRole: 'Platform User', status: 'Active', createdAt: '2026-09-01' },
    { id: 'usr_fahim', name: 'Fahim Karim', email: 'fahim@qrew.io', platformRole: 'Platform User', status: 'Active', createdAt: '2026-09-10' },
    { id: 'usr_nusrat', name: 'Nusrat Jahan', email: 'nusrat@qrew.io', platformRole: 'Platform User', status: 'Active', createdAt: '2026-09-22' },
    { id: 'usr_rafiq', name: 'Rafiqul Islam', email: 'rafiq@qrew.io', phone: '+880 1711-234567', platformRole: 'Platform User', status: 'Active', createdAt: '2026-10-02' },
    { id: 'usr_tanvir', name: 'Tanvir Hasan', email: 'tanvir@qrew.io', platformRole: 'Platform User', status: 'Active', createdAt: '2026-10-18' },
    { id: 'usr_tariq', name: 'Tariqul Alam', email: 'tariq@apex.com', phone: '+880 1712-987654', platformRole: 'Platform User', status: 'Active', createdAt: '2026-10-01' }
  ],
  tenants: [
    {
      id: 'ten_sst',
      name: 'SST',
      ownerName: 'Rafiqul Islam',
      ownerEmail: 'rafiq@sst.com',
      phone: '+880 1711-234567',
      address: 'Port Access Road, Agrabad C/A, Chittagong',
      status: 'Active',
      plan: 'Enterprise',
      createdAt: '2026-09-12'
    },
    {
      id: 'ten_apex',
      name: 'Apex Logistics',
      ownerName: 'Tariqul Alam',
      ownerEmail: 'tariq@apex.com',
      phone: '+880 1712-987654',
      address: 'Gulshan Center Point, Road 90, Gulshan-2, Dhaka',
      status: 'Active',
      plan: 'Professional',
      createdAt: '2026-10-01'
    }
  ],
  offices: [
    {
      id: 'off_ctg_port',
      tenantId: 'ten_sst',
      name: 'Chittagong Port Office',
      location: 'Port Access Road, Chittagong',
      status: 'Active',
      createdAt: '2026-09-15'
    },
    {
      id: 'off_mgl_port',
      tenantId: 'ten_sst',
      name: 'Mongla Port Office',
      location: 'Mongla Port Area, Bagerhat, Khulna',
      status: 'Active',
      createdAt: '2026-09-18'
    },
    {
      id: 'off_dhk_corp',
      tenantId: 'ten_apex',
      name: 'Dhaka Corporate Office',
      location: 'Gulshan-2, Dhaka',
      status: 'Active',
      createdAt: '2026-10-05'
    },
    {
      id: 'off_syl_depot',
      tenantId: 'ten_apex',
      name: 'Sylhet Regional Depot',
      location: 'Airport Road, Subidbazar, Sylhet',
      status: 'Active',
      createdAt: '2026-10-12'
    }
  ],
  tenantMembers: [
    { id: 'tm_1', tenantId: 'ten_sst', userId: 'usr_rafiq', tenantRole: 'Tenant Admin', status: 'Active', joinedAt: '2026-09-12' },
    { id: 'tm_2', tenantId: 'ten_sst', userId: 'usr_jack', tenantRole: 'Tenant Manager', status: 'Active', joinedAt: '2026-09-14' },
    { id: 'tm_3', tenantId: 'ten_sst', userId: 'usr_nusrat', tenantRole: 'Tenant Member', status: 'Active', joinedAt: '2026-09-25' },
    { id: 'tm_4', tenantId: 'ten_sst', userId: 'usr_tanvir', tenantRole: 'Tenant Member', status: 'Active', joinedAt: '2026-10-05' },
    { id: 'tm_5', tenantId: 'ten_sst', userId: 'usr_mina', tenantRole: 'Tenant Member', status: 'Active', joinedAt: '2026-10-10' },
    { id: 'tm_6', tenantId: 'ten_sst', userId: 'usr_fahim', tenantRole: 'Tenant Member', status: 'Active', joinedAt: '2026-10-12' },
    { id: 'tm_7', tenantId: 'ten_apex', userId: 'usr_tariq', tenantRole: 'Tenant Admin', status: 'Active', joinedAt: '2026-10-01' },
    { id: 'tm_8', tenantId: 'ten_apex', userId: 'usr_fahim', tenantRole: 'Tenant Manager', status: 'Active', joinedAt: '2026-10-05' },
    { id: 'tm_9', tenantId: 'ten_apex', userId: 'usr_mina', tenantRole: 'Tenant Member', status: 'Active', joinedAt: '2026-10-08' }
  ],
  officeStaff: [
    { id: 'os_1', officeId: 'off_ctg_port', tenantId: 'ten_sst', userId: 'usr_rafiq', officeRole: 'Office Manager', status: 'Active', assignedAt: '2026-09-15' },
    { id: 'os_2', officeId: 'off_ctg_port', tenantId: 'ten_sst', userId: 'usr_jack', officeRole: 'Office Supervisor', status: 'Active', assignedAt: '2026-09-16' },
    { id: 'os_3', officeId: 'off_ctg_port', tenantId: 'ten_sst', userId: 'usr_nusrat', officeRole: 'Office Staff', status: 'Active', assignedAt: '2026-09-26' },
    { id: 'os_4', officeId: 'off_mgl_port', tenantId: 'ten_sst', userId: 'usr_tanvir', officeRole: 'Office Staff', status: 'Active', assignedAt: '2026-10-06' },
    { id: 'os_5', officeId: 'off_dhk_corp', tenantId: 'ten_apex', userId: 'usr_tariq', officeRole: 'Office Manager', status: 'Active', assignedAt: '2026-10-05' },
    { id: 'os_6', officeId: 'off_dhk_corp', tenantId: 'ten_apex', userId: 'usr_fahim', officeRole: 'Operations Lead', status: 'Active', assignedAt: '2026-10-06' },
    { id: 'os_7', officeId: 'off_syl_depot', tenantId: 'ten_apex', userId: 'usr_mina', officeRole: 'Depot Supervisor', status: 'Active', assignedAt: '2026-10-12' }
  ],
  departments: [
    { id: 'dept_ctg_ops', officeId: 'off_ctg_port', name: 'Port Operations', code: 'OPS', leadName: 'Rafiqul Islam', capacity: 15, status: 'Active', description: 'Container terminal dispatch, berths, and vessel clearance' },
    { id: 'dept_ctg_log', officeId: 'off_ctg_port', name: 'Fleet & Logistics', code: 'LOG', leadName: 'Jack Rahman', capacity: 10, status: 'Active', description: 'Heavy transport logistics, truck fleets, and freight forwarding' },
    { id: 'dept_ctg_sec', officeId: 'off_ctg_port', name: 'Facility Security', code: 'SEC', leadName: 'Nusrat Jahan', capacity: 8, status: 'Active', description: 'CCTV surveillance, entry-exit gate control, and safety protocols' },
    { id: 'dept_ctg_cust', officeId: 'off_ctg_port', name: 'Customs & Compliance', code: 'CST', leadName: 'Tanvir Hasan', capacity: 6, status: 'Active', description: 'Tariff verification, regulatory filings, and inspection oversight' },
    { id: 'dept_mgl_ops', officeId: 'off_mgl_port', name: 'Maritime Cargo & Dispatch', code: 'MCD', leadName: 'Tanvir Hasan', capacity: 12, status: 'Active', description: 'Mongla jetty cargo operations, lighter vessel coordination, and customs handling' },
    { id: 'dept_dhk_ops', officeId: 'off_dhk_corp', name: 'Central Logistics Dispatch', code: 'CLD', leadName: 'Tariqul Alam', capacity: 20, status: 'Active', description: 'National freight scheduling, supply chain routing, and vendor management' },
    { id: 'dept_syl_ops', officeId: 'off_syl_depot', name: 'Regional Cargo & Transit', code: 'RCT', leadName: 'Mina Chowdhury', capacity: 10, status: 'Active', description: 'Northeast zone warehousing, tea and agro cargo logistics' }
  ],
  departmentMembers: [
    { id: 'dm_1', deptId: 'dept_ctg_ops', userId: 'usr_rafiq', deptRole: 'Department Lead', shift: 'Morning (08:00 - 16:00)', status: 'On Duty' },
    { id: 'dm_2', deptId: 'dept_ctg_ops', userId: 'usr_nusrat', deptRole: 'Operations Specialist', shift: 'Morning (08:00 - 16:00)', status: 'On Duty' },
    { id: 'dm_3', deptId: 'dept_ctg_log', userId: 'usr_jack', deptRole: 'Logistics Supervisor', shift: 'Evening (14:00 - 22:00)', status: 'Upcoming' },
    { id: 'dm_4', deptId: 'dept_ctg_sec', userId: 'usr_tanvir', deptRole: 'Security Officer', shift: 'Night (22:00 - 06:00)', status: 'Off Duty' },
    { id: 'dm_5', deptId: 'dept_dhk_ops', userId: 'usr_tariq', deptRole: 'Department Lead', shift: 'Morning (08:00 - 16:00)', status: 'On Duty' },
    { id: 'dm_6', deptId: 'dept_syl_ops', userId: 'usr_mina', deptRole: 'Department Lead', shift: 'Morning (08:00 - 16:00)', status: 'On Duty' }
  ],
  officeConfigs: {
    'off_ctg_port': {
      code: 'CTG-PORT-01',
      tier: 'Tier 1 Regional Hub',
      floorArea: '18,500 sq ft',
      maxOccupancy: 120,
      operatingHours: '24/7 Continuous (3 Shifts)',
      primaryContact: '+880 31 710000',
      emergencyContact: '+880 31 710999',
      shifts: ['Morning (08:00 - 16:00)', 'Evening (14:00 - 22:00)', 'Night (22:00 - 06:00)'],
      checkInGrace: '15 mins',
      accessControlMode: 'Biometric + Smart Card'
    },
    'off_mgl_port': {
      code: 'MGL-PORT-02',
      tier: 'Tier 2 Coastal Port Facility',
      floorArea: '12,400 sq ft',
      maxOccupancy: 80,
      operatingHours: '24/7 Continuous Operations',
      primaryContact: '+880 4662 75100',
      emergencyContact: '+880 4662 75199',
      shifts: ['Morning (08:00 - 16:00)', 'Evening (14:00 - 22:00)'],
      checkInGrace: '15 mins',
      accessControlMode: 'Biometric Smart Access'
    },
    'off_dhk_corp': {
      code: 'DHK-CORP-01',
      tier: 'Tier 1 Headquarters',
      floorArea: '14,000 sq ft',
      maxOccupancy: 90,
      operatingHours: '08:00 - 20:00 (2 Shifts)',
      primaryContact: '+880 2 9880001',
      emergencyContact: '+880 2 9880009',
      shifts: ['Morning (08:00 - 16:00)', 'Evening (14:00 - 22:00)'],
      checkInGrace: '15 mins',
      accessControlMode: 'Smart Card Access'
    },
    'off_syl_depot': {
      code: 'SYL-DEP-02',
      tier: 'Tier 2 Regional Facility',
      floorArea: '9,500 sq ft',
      maxOccupancy: 45,
      operatingHours: '24/7 Continuous Operations',
      primaryContact: '+880 821 710001',
      emergencyContact: '+880 821 710009',
      shifts: ['Morning (08:00 - 16:00)', 'Night (22:00 - 06:00)'],
      checkInGrace: '15 mins',
      accessControlMode: 'Biometric Access'
    }
  },
  memberTasks: [
    { id: 'tsk_1', userId: 'usr_nusrat', deptId: 'dept_ctg_ops', title: 'Verify inbound cargo manifests for Berth 4', status: 'Completed', priority: 'High', dueTime: '11:00 AM', category: 'Compliance' },
    { id: 'tsk_2', userId: 'usr_nusrat', deptId: 'dept_ctg_ops', title: 'Conduct dock gantry crane equipment safety checklist', status: 'In Progress', priority: 'High', dueTime: '02:30 PM', category: 'Inspection' },
    { id: 'tsk_3', userId: 'usr_nusrat', deptId: 'dept_ctg_ops', title: 'Submit end-of-shift dispatch report to Rafiqul Islam', status: 'Pending', priority: 'Normal', dueTime: '03:45 PM', category: 'Reporting' },
    { id: 'tsk_4', userId: 'usr_jack', deptId: 'dept_ctg_log', title: 'Audit fleet fuel consumption logs for October', status: 'Completed', priority: 'Normal', dueTime: '04:00 PM', category: 'Audit' },
    { id: 'tsk_5', userId: 'usr_jack', deptId: 'dept_ctg_log', title: 'Dispatch trailer convoy 12-B to Dhaka corridor', status: 'In Progress', priority: 'High', dueTime: '06:00 PM', category: 'Dispatch' },
    { id: 'tsk_6', userId: 'usr_rafiq', deptId: 'dept_ctg_ops', title: 'Review port authority customs clearance backlog', status: 'In Progress', priority: 'High', dueTime: '01:00 PM', category: 'Review' },
    { id: 'tsk_7', userId: 'usr_mina', deptId: 'dept_dhk_trade', title: 'Authorize quarterly agricultural commodity futures', status: 'Pending', priority: 'High', dueTime: '04:30 PM', category: 'Trading' },
    { id: 'tsk_8', userId: 'usr_tanvir', deptId: 'dept_ctg_sec', title: 'Patrol Gate 3 biometric access terminals', status: 'In Progress', priority: 'Normal', dueTime: '11:30 PM', category: 'Security' }
  ],
  memberActivity: [
    { id: 'act_1', userId: 'usr_nusrat', title: 'Shift Check-In', description: 'Checked in for Morning Shift (08:00 - 16:00) at Terminal 1', timestamp: 'Today, 07:54 AM', type: 'checkin' },
    { id: 'act_2', userId: 'usr_nusrat', title: 'Task Completed', description: 'Marked "Verify inbound cargo manifests" as Completed', timestamp: 'Today, 10:48 AM', type: 'task' },
    { id: 'act_3', userId: 'usr_nusrat', title: 'Safety Protocol Acknowledged', description: 'Read and acknowledged Terminal Safety Circular #402', timestamp: 'Yesterday, 03:15 PM', type: 'system' }
  ],
  roles: {
    platform: [
      {
        id: 'role_plt_owner',
        name: 'Platform Owner',
        description: 'Complete administrative control over the entire platform, tenants, and system-level configuration.',
        permissions: ['platform_read', 'platform_crud', 'tenant_create', 'tenant_read', 'tenant_update', 'tenant_delete']
      },
      {
        id: 'role_plt_admin',
        name: 'Platform Admin',
        description: 'Operational administration of tenants, user accounts, and platform monitoring.',
        permissions: ['platform_read', 'tenant_create', 'tenant_read', 'tenant_update']
      },
      {
        id: 'role_plt_user',
        name: 'Platform User',
        description: 'Base platform account with view privileges and membership access across assigned tenants.',
        permissions: ['platform_read', 'tenant_read']
      }
    ],
    tenant: [
      {
        id: 'role_ten_admin',
        name: 'Tenant Admin',
        description: 'Autonomous administration within the tenant: manage tenant offices, tenant members, and tenant settings.',
        permissions: ['tenant_read', 'tenant_update', 'office_create', 'office_read', 'office_update', 'office_delete']
      },
      {
        id: 'role_ten_manager',
        name: 'Tenant Manager',
        description: 'Supervise office operations, oversee member assignments, and audit tenant activities.',
        permissions: ['tenant_read', 'office_read', 'office_update']
      },
      {
        id: 'role_ten_member',
        name: 'Tenant Member',
        description: 'Verified organization member eligible for assignment to tenant offices.',
        permissions: ['tenant_read', 'office_read']
      }
    ],
    office: [
      {
        id: 'role_off_manager',
        name: 'Office Manager',
        description: 'Oversees office facilities, assigns office staff, and controls branch operations.',
        permissions: ['office_read', 'office_update', 'office_create_off_mem', 'office_del_off_mem', 'office_update_off_mem', 'office_read_off_mem']
      },
      {
        id: 'role_off_supervisor',
        name: 'Office Supervisor',
        description: 'Supervises daily office workflows, shift rosters, and staff check-ins.',
        permissions: ['office_read', 'office_update_off_mem', 'office_read_off_mem']
      },
      {
        id: 'role_off_staff',
        name: 'Office Staff',
        description: 'General staff member working on-site at this designated office location.',
        permissions: ['office_read', 'office_read_off_mem']
      }
    ]
  },
  auditLogs: [
    {
      id: 'LOG-108',
      actor: 'Sakib',
      action: 'ASSIGN_ROLE',
      resourceType: 'Office Staff',
      resourceId: 'off_mgl_port',
      description: 'Assigned Tanvir Hasan as Office Staff for Mongla Port Office',
      timestamp: '2026-10-18 14:15:00'
    },
    {
      id: 'LOG-107',
      actor: 'Sakib',
      action: 'CREATE',
      resourceType: 'Office',
      resourceId: 'off_mgl_port',
      description: 'Created office Mongla Port Office under SST',
      timestamp: '2026-09-18 11:30:00'
    },
    {
      id: 'LOG-106',
      actor: 'Sakib',
      action: 'ASSIGN_ROLE',
      resourceType: 'Office Staff',
      resourceId: 'off_ctg_port',
      description: 'Assigned Jack Rahman as Office Supervisor for Chittagong Port Office',
      timestamp: '2026-09-16 09:45:00'
    },
    {
      id: 'LOG-105',
      actor: 'Sakib',
      action: 'CREATE',
      resourceType: 'Office',
      resourceId: 'off_ctg_port',
      description: 'Created office Chittagong Port Office under SST',
      timestamp: '2026-09-15 13:00:00'
    },
    {
      id: 'LOG-104',
      actor: 'Sakib',
      action: 'ADD_MEMBER',
      resourceType: 'Tenant Member',
      resourceId: 'ten_sst',
      description: 'Added Jack Rahman as Tenant Manager in SST',
      timestamp: '2026-09-14 15:10:00'
    },
    {
      id: 'LOG-101',
      actor: 'Sakib',
      action: 'CREATE',
      resourceType: 'Tenant',
      resourceId: 'ten_sst',
      description: 'Provisioned organization SST for Rafiqul Islam',
      timestamp: '2026-09-12 09:00:00'
    }
  ],
  operationalFiles: [
    {
      id: 'prj_ctg_01',
      type: 'project',
      fileCode: 'PRJ-CTG-0042',
      title: 'MV Meghna Harmony - Berth 4 Discharge & Port Call',
      officeId: 'off_ctg_port',
      tenantId: 'ten_sst',
      clientName: 'Apex Shipping Lines Ltd.',
      clientCode: 'CLI-APX-88',
      billingTerms: 'Net 30',
      status: 'In-Progress',
      vesselName: 'MV Meghna Harmony',
      portCall: 'Chittagong Port',
      terminal: 'NCT Berth 4',
      voyageNo: 'V-2026-08',
      grt: 3500,
      nrt: 1800,
      arrivalDate: '2026-11-20',
      berthingDate: '2026-11-21',
      departureDate: '2026-11-25',
      scheduledDates: '2026-11-20 to 2026-11-25',
      defaultDeliverables: [
        { name: 'Harbor Pilotage & Vessel Escort', token: 'PILOT_FEE', equation: '1200.00' },
        { name: 'Berth Clearance & Port Authority Dues', token: 'BERTH_PERMIT', equation: '800.00' },
        { name: 'Gantry Crane Operations (10 hrs)', token: 'CRANE_OPS', equation: '= 10 * 350' },
        { name: 'Container Terminal Yard Storage', token: 'TERMINAL_FEE', equation: '1500.00' }
      ]
    },
    {
      id: 'prj_ctg_02',
      type: 'project',
      fileCode: 'PRJ-CTG-0055',
      title: 'MV Banglar Joy - Dredging Supervision & Cargo Discharge',
      officeId: 'off_ctg_port',
      tenantId: 'ten_sst',
      clientName: 'Pacific Ocean Transport Inc.',
      clientCode: 'CLI-POT-42',
      billingTerms: 'Due on Receipt',
      status: 'Scheduled',
      vesselName: 'MV Banglar Joy',
      portCall: 'Chittagong Port',
      terminal: 'CCT Berth 2',
      voyageNo: 'V-2026-11',
      grt: 4200,
      nrt: 2150,
      arrivalDate: '2026-12-01',
      berthingDate: '2026-12-02',
      departureDate: '2026-12-07',
      scheduledDates: '2026-12-01 to 2026-12-10',
      defaultDeliverables: [
        { name: 'Rapid Response Harbor Tugboat Fleet', token: 'DISPATCH_BASE', equation: '3200.00' },
        { name: 'Under-Hull Diving Inspection Crew', token: 'DIVER_CREW', equation: '1400.00' }
      ]
    },
    {
      id: 'prj_mgl_02',
      type: 'project',
      fileCode: 'PRJ-MGL-0105',
      title: 'MV Mongla Express - Jetty Towage & Handling',
      officeId: 'off_mgl_port',
      tenantId: 'ten_sst',
      clientName: 'Bengal Maritime Freight Ltd.',
      clientCode: 'CLI-BMF-10',
      billingTerms: 'Net 15',
      status: 'Scheduled',
      vesselName: 'MV Mongla Express',
      portCall: 'Mongla Port',
      terminal: 'Jetty 5',
      voyageNo: 'V-2026-03',
      grt: 2800,
      nrt: 1400,
      arrivalDate: '2026-11-28',
      berthingDate: '2026-11-29',
      departureDate: '2026-12-04',
      scheduledDates: '2026-11-28 to 2026-12-04',
      defaultDeliverables: [
        { name: 'Lighter Barge Towage & Jetty Shunting', token: 'LIGHTER_TOW', equation: '1850.00' },
        { name: 'Mongla Port Basin Wharfage Surcharge', token: 'WHARF_CHARGE', equation: '650.00' }
      ]
    },
    {
      id: 'prod_stevedoring_std',
      type: 'product',
      fileCode: 'PROD-STEVE-20',
      title: 'Standard 20ft Container Stevedoring',
      officeId: 'off_ctg_port',
      tenantId: 'ten_sst',
      clientName: 'Apex Shipping Lines Ltd.',
      clientCode: 'CLI-APX-88',
      billingTerms: 'Net 30',
      status: 'Active',
      sku: 'SKU-STEVE-20',
      baseUnitPrice: 350.00,
      stockOnHand: 'Unlimited Service',
      defaultDeliverables: [
        { name: 'Standard 20ft Container Stevedoring (Unit)', token: 'UNIT_STEVEDORE', equation: '350.00' },
        { name: 'Quayside Handling Tariff', token: 'QUAY_TARIFF', equation: '120.00' }
      ]
    },
    {
      id: 'prod_gantry_block',
      type: 'product',
      fileCode: 'PROD-CRANE-10H',
      title: 'Gantry Heavy-Lift Crane Block (10h Package)',
      officeId: 'off_ctg_port',
      tenantId: 'ten_sst',
      clientName: 'Pacific Ocean Transport Inc.',
      clientCode: 'CLI-POT-42',
      billingTerms: 'Due on Receipt',
      status: 'Active',
      sku: 'SKU-CRANE-10H',
      baseUnitPrice: 3500.00,
      stockOnHand: '12 Available',
      defaultDeliverables: [
        { name: 'Gantry Heavy-Lift Crane Block (10h Package)', token: 'CRANE_BLOCK', equation: '3500.00' },
        { name: 'Operator & Rigging Certification Fee', token: 'RIG_CERT', equation: '450.00' }
      ]
    }
  ],
  premadeDeliverables: [
    { token: 'PILOT_FEE', name: 'Harbor Pilotage & Vessel Escort', equation: '1200.00', category: 'Navigation & Port' },
    { token: 'WHARFAGE_FEE', name: 'Wharfage Dues & Quay Access', equation: '850.00', category: 'Navigation & Port' },
    { token: 'CRANE_OPS', name: 'Gantry Heavy-Lift Crane (10 hrs)', equation: '= 10 * 350', category: 'Stevedoring & Cargo' },
    { token: 'TERMINAL_FEE', name: 'Container Terminal Yard Storage', equation: '1500.00', category: 'Stevedoring & Cargo' },
    { token: 'CUSTOMS_CLR', name: 'Customs Regulatory Document Clearance', equation: '450.00', category: 'Compliance & Legal' },
    { token: 'TOWAGE_DISP', name: 'Emergency Harbor Towage Assistance', equation: '2200.00', category: 'Emergency Services' },
    { token: 'MOORING_FEE', name: 'Vessel Berthing & Line Handlers', equation: '400.00', category: 'Navigation & Port' },
    { token: 'INSPECT_CERT', name: 'Maritime Dangerous Goods Compliance Signoff', equation: '650.00', category: 'Compliance & Legal' }
  ],
  invoiceTemplates: [
    {
      id: 'tpl_pda',
      officeId: 'off_ctg_port',
      tenantId: 'ten_sst',
      name: 'PDA',
      description: 'Proforma Disbursement Account for Chittagong Port calls',
      code: 'PDA-2026-001',
      tag: 'STANDARD',
      isDefault: true,
      status: 'Active',
      currency: 'USD',
      currencySymbol: '$',
      updatedAt: 'Nov 19, 2026',
      createdAt: '2026-10-10',
      headerFields: [
        { key: 'NAME', label: 'Name', value: 'MV Banglar Samriddhi Port Call' },
        { key: 'STATUS', label: 'Status', value: 'Active' },
        { key: 'CLIENTID', label: 'Client', value: 'Apex Shipping Lines Ltd.' },
        { key: 'TERMINAL', label: 'Terminal', value: 'NCT Berth 4' },
        { key: 'VOYAGE_NO', label: 'Voyage No', value: 'V-2026-08' },
        { key: 'PORT', label: 'Port', value: 'Chittagong Port' },
        { key: 'ARRIVAL', label: 'Arrival', value: '2026-11-20' },
        { key: 'NRT', label: 'NRT', value: '1800' },
        { key: 'BERTHING', label: 'Berthing', value: '2026-11-21' },
        { key: 'GRT', label: 'GRT', value: '3500' },
        { key: 'DEPARTURE', label: 'Departure', value: '2026-11-25' },
        { key: 'NAME_OF_VESSEL', label: 'Name Of Vessel', value: 'MV Banglar Samriddhi' }
      ],
      globalConstants: {
        DOLLAR_RATE: 121,
        PORT_DUES_PER_GRT: 0.31,
        IN_OUT_WARD: 2500,
        MMD: 1150,
        LEVY_FUND_BDT: 2000,
        LIGHT_DUES_PER_NRT: 12.50,
        NOC: 1150,
        WAIVER: 2500,
        SOURCE_TAX_RATE: 0.08
      },
      localConstants: {
        AGENCY_BASE: 500.00
      },
      sections: [
        {
          id: 'sec_port_tariff',
          title: 'AS PER PORT TARIFF',
          color: 'green',
          rows: [
            { id: 'r_port_1', token: 'PORT_DUES', name: 'PORT DUES', equation: '0', sl: 1, editable: 'NOT EDITABLE' },
            { id: 'r_port_2', token: 'PILOT', name: 'PILOT-1 UNIT MANDATORY PAY', equation: '1230', sl: 2, editable: 'NOT EDITABLE' },
            { id: 'r_port_3', token: 'TUGBOAT', name: 'PORT TUG HIRE 1 UNIT MANDATORY PAY', equation: '800', sl: 3, editable: 'NOT EDITABLE' }
          ],
          charges: [
            { id: 'c_port_vat', token: 'ON_1_VAT', name: 'Vat', equation: '0', editable: 'NOT EDITABLE' }
          ],
          subtotal: { token: 'SEC_PORT_TARIFF_TOTAL', label: 'Section Total', equation: '= PORT_DUES + PILOT + TUGBOAT' }
        },
        {
          id: 'sec_as_tariff',
          title: 'AS PER TARIFF',
          color: 'blue',
          rows: [
            { id: 'r_tar_1', token: 'LEVY_FUND', name: 'Levy Fund', equation: '16.53', sl: 4, editable: 'NOT EDITABLE' },
            { id: 'r_tar_2', token: 'LIGHT_DUES', name: 'Light Dues', equation: '0', sl: 5, editable: 'NOT EDITABLE' },
            { id: 'r_tar_3', token: 'IN_OUT_MMD_NOC', name: 'IN /OUT WARD AND MMD NOC CHARGE', equation: '30.17', sl: 6, editable: 'NOT EDITABLE' },
            { id: 'r_tar_4', token: 'WAIVER_CLEARANCE', name: 'Waiver Clearance', equation: '20.66', sl: 7, editable: 'NOT EDITABLE' }
          ],
          charges: [],
          subtotal: { token: 'SEC_AS_TARIFF_TOTAL', label: 'Section Total', equation: '= LEVY_FUND + LIGHT_DUES + IN_OUT_MMD_NOC + WAIVER_CLEARANCE' }
        },
        {
          id: 'sec_private',
          title: 'PRIVATE SERVICE',
          color: 'orange',
          rows: [
            { id: 'r_pvt_1', token: 'PRIVATE_PILOT', name: 'PRIVATE PILOT IN/OUT WARD', equation: '0', sl: 8, editable: 'NOT EDITABLE' },
            { id: 'r_pvt_2', token: 'TUG_BOAT', name: 'TUG BOAT 2 UNITS 2200-2400 HP BERTHING & UNBERTHING', equation: '0', sl: 9, editable: 'NOT EDITABLE' },
            { id: 'r_pvt_3', token: 'SOURCE_TAX', name: 'Source Tax', equation: '0', sl: 10, editable: 'NOT EDITABLE' },
            { id: 'r_pvt_4', token: 'AGENCY_FEE', name: 'Agency Fee', equation: '0', sl: 11, editable: 'NOT EDITABLE' }
          ],
          charges: [
            { id: 'c_pvt_st', token: 'PVT_SOURCE_TAX', name: 'Source Tax', equation: '0', editable: 'NOT EDITABLE' },
            { id: 'c_pvt_vat', token: 'PVT_VAT', name: 'Vat', equation: '0', editable: 'NOT EDITABLE' }
          ],
          subtotal: { token: 'SEC_PRIVATE_TOTAL', label: 'Section Total', equation: '= PRIVATE_PILOT + TUG_BOAT + SOURCE_TAX + AGENCY_FEE' }
        }
      ],
      grandTotal: {
        token: 'TOTAL',
        label: 'TOTAL',
        equation: '= SEC_PORT_TARIFF_TOTAL + SEC_AS_TARIFF_TOTAL + SEC_PRIVATE_TOTAL'
      }
    },
    {
      id: 'tpl_fda',
      officeId: 'off_ctg_port',
      tenantId: 'ten_sst',
      name: 'FDA',
      description: 'Final Disbursement Account for completed vessel clearance',
      code: 'FDA-2026-001',
      tag: 'STANDARD',
      isDefault: false,
      status: 'Active',
      currency: 'USD',
      currencySymbol: '$',
      updatedAt: 'Oct 22, 2026',
      createdAt: '2026-09-15',
      headerFields: [
        { key: 'NAME', label: 'Name', value: 'Final Disbursement Clearance' },
        { key: 'STATUS', label: 'Status', value: 'Completed' },
        { key: 'CLIENTID', label: 'Client', value: 'Apex Shipping Lines Ltd.' },
        { key: 'TERMINAL', label: 'Terminal', value: 'NCT Berth 4' },
        { key: 'VOYAGE_NO', label: 'Voyage No', value: 'V-2026-07' },
        { key: 'PORT', label: 'Port', value: 'Chittagong Port' },
        { key: 'ARRIVAL', label: 'Arrival', value: '2026-10-18' },
        { key: 'NRT', label: 'NRT', value: '2100' },
        { key: 'BERTHING', label: 'Berthing', value: '2026-10-19' },
        { key: 'GRT', label: 'GRT', value: '4200' },
        { key: 'DEPARTURE', label: 'Departure', value: '2026-10-22' },
        { key: 'NAME_OF_VESSEL', label: 'Name Of Vessel', value: 'MV Banglar Agradoot' }
      ],
      globalConstants: {
        DOLLAR_RATE: 121,
        PORT_DUES_PER_GRT: 0.31,
        IN_OUT_WARD: 2500,
        MMD: 1150
      },
      localConstants: {},
      sections: [
        {
          id: 'sec_fda_port',
          title: 'AS PER PORT TARIFF',
          color: 'green',
          rows: [
            { id: 'r_fda_1', token: 'FDA_PORT_DUES', name: 'PORT DUES', equation: '1302', sl: 1, editable: 'NOT EDITABLE' },
            { id: 'r_fda_2', token: 'FDA_PILOT', name: 'PILOT-1 UNIT MANDATORY PAY', equation: '1230', sl: 2, editable: 'NOT EDITABLE' }
          ],
          charges: [],
          subtotal: { token: 'SEC_FDA_PORT_TOTAL', label: 'Section Total', equation: '= FDA_PORT_DUES + FDA_PILOT' }
        }
      ],
      grandTotal: {
        token: 'TOTAL',
        label: 'TOTAL',
        equation: '= SEC_FDA_PORT_TOTAL'
      }
    },
    {
      id: 'tpl_expense1',
      officeId: 'off_ctg_port',
      tenantId: 'ten_sst',
      name: 'expense1',
      description: 'Standard operational field expense billing',
      code: 'EXPENSE1-2026-001',
      tag: 'STANDARD',
      isDefault: false,
      status: 'Active',
      currency: 'USD',
      currencySymbol: '$',
      updatedAt: 'Oct 22, 2026',
      createdAt: '2026-09-20',
      headerFields: [
        { key: 'NAME', label: 'Name', value: 'Fleet Expense Allocation' },
        { key: 'STATUS', label: 'Status', value: 'Active' },
        { key: 'CLIENTID', label: 'Client', value: 'General Port Fleet' },
        { key: 'TERMINAL', label: 'Terminal', value: 'Fleet Anchorage B' },
        { key: 'VOYAGE_NO', label: 'Voyage No', value: 'EXP-2026-03' },
        { key: 'PORT', label: 'Port', value: 'Chittagong Port' },
        { key: 'ARRIVAL', label: 'Arrival', value: '2026-10-15' },
        { key: 'NRT', label: 'NRT', value: '950' },
        { key: 'BERTHING', label: 'Berthing', value: '2026-10-16' },
        { key: 'GRT', label: 'GRT', value: '1850' },
        { key: 'DEPARTURE', label: 'Departure', value: '2026-10-22' },
        { key: 'NAME_OF_VESSEL', label: 'Name Of Vessel', value: 'MT Chittagong Pioneer' }
      ],
      globalConstants: {
        DOLLAR_RATE: 121
      },
      localConstants: {},
      sections: [
        {
          id: 'sec_exp_1',
          title: 'OPERATIONAL EXPENSES',
          color: 'blue',
          rows: [
            { id: 'r_exp_1', token: 'FUEL_COST', name: 'Tugboat Marine Diesel Bunkering', equation: '2400', sl: 1, editable: 'EDITABLE' },
            { id: 'r_exp_2', token: 'CREW_ALLOW', name: 'Deck Crew Shift Allowance', equation: '650', sl: 2, editable: 'EDITABLE' }
          ],
          charges: [],
          subtotal: { token: 'SEC_EXP_TOTAL', label: 'Section Total', equation: '= FUEL_COST + CREW_ALLOW' }
        }
      ],
      grandTotal: {
        token: 'TOTAL',
        label: 'TOTAL',
        equation: '= SEC_EXP_TOTAL'
      }
    },
    {
      id: 'tpl_template11',
      officeId: 'off_ctg_port',
      tenantId: 'ten_sst',
      name: 'template11',
      description: 'Standard container freight retainer billing',
      code: 'INV-26-001',
      tag: 'STANDARD',
      isDefault: false,
      status: 'Active',
      currency: 'USD',
      currencySymbol: '$',
      updatedAt: 'Nov 19, 2026',
      createdAt: '2026-10-01',
      headerFields: [
        { key: 'NAME', label: 'Name', value: 'Container Freight Retainer' },
        { key: 'STATUS', label: 'Status', value: 'Active' },
        { key: 'CLIENTID', label: 'Client', value: 'Pacific Ocean Transport Inc.' },
        { key: 'TERMINAL', label: 'Terminal', value: 'CCT Berth 2' },
        { key: 'VOYAGE_NO', label: 'Voyage No', value: 'V-2026-11' },
        { key: 'PORT', label: 'Port', value: 'Chittagong Port' },
        { key: 'ARRIVAL', label: 'Arrival', value: '2026-11-12' },
        { key: 'NRT', label: 'NRT', value: '2400' },
        { key: 'BERTHING', label: 'Berthing', value: '2026-11-13' },
        { key: 'GRT', label: 'GRT', value: '4800' },
        { key: 'DEPARTURE', label: 'Departure', value: '2026-11-18' },
        { key: 'NAME_OF_VESSEL', label: 'Name Of Vessel', value: 'MV Pacific Voyager' }
      ],
      globalConstants: {
        DOLLAR_RATE: 121
      },
      localConstants: {},
      sections: [
        {
          id: 'sec_t11_1',
          title: 'AS PER TARIFF',
          color: 'green',
          rows: [
            { id: 'r_t11_1', token: 'RETAINER_FEE', name: 'Quarterly Terminal Access Retainer', equation: '5000', sl: 1, editable: 'EDITABLE' }
          ],
          charges: [],
          subtotal: { token: 'SEC_T11_TOTAL', label: 'Section Total', equation: '= RETAINER_FEE' }
        }
      ],
      grandTotal: {
        token: 'TOTAL',
        label: 'TOTAL',
        equation: '= SEC_T11_TOTAL'
      }
    }
  ],
  officeInvoices: [
    {
      id: 'inv_101',
      officeId: 'off_ctg_port',
      tenantId: 'ten_sst',
      invoiceNo: 'INV-2026-084',
      clientName: 'Apex Shipping Lines Ltd.',
      clientCode: 'APEX-SHP',
      vessel: 'MV Banglar Samriddhi',
      voyageNo: 'V-2026-08',
      issueDate: '2026-11-18',
      dueDate: '2026-12-18',
      amount: 48500.00,
      currency: 'USD',
      currencySymbol: '$',
      status: 'Paid',
      paidDate: '2026-11-22',
      items: [
        { name: 'Port Dues & Berthing Charges (NCT Berth 4)', amount: 24500.00 },
        { name: 'Pilotage & Harbor Tug Assistance', amount: 12800.00 },
        { name: 'Agency Operational Fee & Customs Clearance', amount: 11200.00 }
      ],
      notes: 'Disbursement settled via SCB wire transfer ref #88214.'
    },
    {
      id: 'inv_102',
      officeId: 'off_ctg_port',
      tenantId: 'ten_sst',
      invoiceNo: 'INV-2026-085',
      clientName: 'Maersk Bangladesh Ltd.',
      clientCode: 'MAERSK-BD',
      vessel: 'MV Northern Diamond',
      voyageNo: 'ND-441',
      issueDate: '2026-11-20',
      dueDate: '2026-12-20',
      amount: 36200.00,
      currency: 'USD',
      currencySymbol: '$',
      status: 'Pending',
      items: [
        { name: 'Container Terminal Yard Storage & Handling', amount: 18500.00 },
        { name: 'Gantry Crane Discharge Operations', amount: 11500.00 },
        { name: 'Documentation & Manifest Filing', amount: 6200.00 }
      ],
      notes: 'Pending client accounts payable approval cycle.'
    },
    {
      id: 'inv_103',
      officeId: 'off_ctg_port',
      tenantId: 'ten_sst',
      invoiceNo: 'INV-2026-086',
      clientName: 'Hapag-Lloyd Maritime',
      clientCode: 'HL-MAR',
      vessel: 'MV Ocean Voyager',
      voyageNo: 'HL-882',
      issueDate: '2026-10-15',
      dueDate: '2026-11-15',
      amount: 14850.00,
      currency: 'USD',
      currencySymbol: '$',
      status: 'Overdue',
      items: [
        { name: 'Emergency Harbor Towage Assistance', amount: 8850.00 },
        { name: 'Vessel Berthing Line Handlers & Mooring', amount: 6000.00 }
      ],
      notes: 'Overdue by 9 days. First reminder dispatched on Nov 16.'
    },
    {
      id: 'inv_104',
      officeId: 'off_ctg_port',
      tenantId: 'ten_sst',
      invoiceNo: 'INV-2026-087',
      clientName: 'Cosco Shipping Lines',
      clientCode: 'COSCO-BD',
      vessel: 'MV Golden Fortune',
      voyageNo: 'CS-109',
      issueDate: '2026-11-22',
      dueDate: '2026-12-22',
      amount: 28900.00,
      currency: 'USD',
      currencySymbol: '$',
      status: 'Paid',
      paidDate: '2026-11-23',
      items: [
        { name: 'Bulk Cargo Stevedoring & Wharfage Access', amount: 16500.00 },
        { name: 'Port Authority Environmental Levy & Security', amount: 7400.00 },
        { name: 'Maritime Clearance & NOC Expediting', amount: 5000.00 }
      ],
      notes: 'Paid in full via HSBC swift transfer.'
    },
    {
      id: 'inv_105',
      officeId: 'off_ctg_port',
      tenantId: 'ten_sst',
      invoiceNo: 'INV-2026-088',
      clientName: 'Evergreen Marine Corp',
      clientCode: 'EMC-LINE',
      vessel: 'MV Green Horizon',
      voyageNo: 'EM-512',
      issueDate: '2026-11-23',
      dueDate: '2026-12-23',
      amount: 14400.00,
      currency: 'USD',
      currencySymbol: '$',
      status: 'Draft',
      items: [
        { name: 'Proforma Bunker Supply & Fresh Water Delivery', amount: 9800.00 },
        { name: 'Crew Change & Immigration Logistics', amount: 4600.00 }
      ],
      notes: 'Draft proforma undergoing master verification.'
    },
    {
      id: 'inv_106',
      officeId: 'off_mgl_port',
      tenantId: 'ten_sst',
      invoiceNo: 'INV-2026-089',
      clientName: 'Apex Shipping Lines Ltd.',
      clientCode: 'APEX-SHP',
      vessel: 'MV Meghna Star',
      voyageNo: 'MS-202',
      issueDate: '2026-11-19',
      dueDate: '2026-12-19',
      amount: 21500.00,
      currency: 'USD',
      currencySymbol: '$',
      status: 'Paid',
      paidDate: '2026-11-21',
      items: [
        { name: 'Mongla Fairway Anchorage & Pilotage', amount: 14000.00 },
        { name: 'Inland Lighterage Coordination', amount: 7500.00 }
      ],
      notes: 'Cleared through Mongla Port Accounts.'
    }
  ],
  officeTransactions: [
    {
      id: 'txn_101',
      officeId: 'off_ctg_port',
      tenantId: 'ten_sst',
      date: '2026-11-23',
      reference: 'TXN-88219',
      type: 'Credit',
      category: 'Client Settlement',
      description: 'Cosco Shipping settlement for INV-2026-087',
      amount: 28900.00,
      currency: 'USD',
      method: 'SWIFT Wire',
      status: 'Completed'
    },
    {
      id: 'txn_102',
      officeId: 'off_ctg_port',
      tenantId: 'ten_sst',
      date: '2026-11-22',
      reference: 'TXN-88214',
      type: 'Credit',
      category: 'Client Settlement',
      description: 'Apex Shipping settlement for INV-2026-084',
      amount: 48500.00,
      currency: 'USD',
      method: 'Bank Transfer',
      status: 'Completed'
    },
    {
      id: 'txn_103',
      officeId: 'off_ctg_port',
      tenantId: 'ten_sst',
      date: '2026-11-21',
      reference: 'TXN-88190',
      type: 'Debit',
      category: 'Port Authority Tariff',
      description: 'Chittagong Port Authority (CPA) Berthing & Pilotage Disbursal',
      amount: 14200.00,
      currency: 'USD',
      method: 'Bank Draft',
      status: 'Completed'
    },
    {
      id: 'txn_104',
      officeId: 'off_ctg_port',
      tenantId: 'ten_sst',
      date: '2026-11-19',
      reference: 'TXN-88155',
      type: 'Debit',
      category: 'Towage & Marine Service',
      description: 'Harbor Tug Assistance Disbursal for NCT Berth 4',
      amount: 5600.00,
      currency: 'USD',
      method: 'Pay Order',
      status: 'Completed'
    },
    {
      id: 'txn_105',
      officeId: 'off_ctg_port',
      tenantId: 'ten_sst',
      date: '2026-11-17',
      reference: 'TXN-88112',
      type: 'Debit',
      category: 'Stevedoring & Equipment',
      description: 'Heavy crane & container yard equipment rental fee',
      amount: 3800.00,
      currency: 'USD',
      method: 'Electronic Transfer',
      status: 'Completed'
    },
    {
      id: 'txn_106',
      officeId: 'off_ctg_port',
      tenantId: 'ten_sst',
      date: '2026-11-14',
      reference: 'TXN-88091',
      type: 'Debit',
      category: 'Customs & Regulatory',
      description: 'Customs regulatory document processing and compliance duty',
      amount: 1950.00,
      currency: 'USD',
      method: 'Treasury Challan',
      status: 'Completed'
    }
  ],
  officeExpenses: [
    {
      id: 'exp_1',
      officeId: 'off_ctg_port',
      tenantId: 'ten_sst',
      fileProject: 'PRJ-CTG-0042 (MV Meghna Harmony)',
      spentBy: 'Rafiqul Islam',
      category: 'Port Authority Tariffs',
      description: 'Emergency berthing line handlers overtime fee at NCT Berth 4',
      date: '2026-11-22',
      amount: 1250.00,
      currency: 'USD',
      wallet: 'Operations Petty Cash'
    },
    {
      id: 'exp_2',
      officeId: 'off_ctg_port',
      tenantId: 'ten_sst',
      fileProject: 'PRJ-CTG-0041 (MV Northern Diamond)',
      spentBy: 'Jack Rahman',
      category: 'Logistics & Transport',
      description: 'Container yard transfer shuttle and pilot escort van rental',
      date: '2026-11-20',
      amount: 480.00,
      currency: 'USD',
      wallet: 'Operations Petty Cash'
    },
    {
      id: 'exp_3',
      officeId: 'off_ctg_port',
      tenantId: 'ten_sst',
      fileProject: 'PRJ-CTG-0039 (MV Ocean Voyager)',
      spentBy: 'Nusrat Jahan',
      category: 'Customs & Regulatory',
      description: 'Dangerous goods documentation clearance stamp duty & filing fees',
      date: '2026-11-18',
      amount: 650.00,
      currency: 'USD',
      wallet: 'Port Authority Escrow'
    },
    {
      id: 'exp_4',
      officeId: 'off_ctg_port',
      tenantId: 'ten_sst',
      fileProject: 'PRJ-CTG-0038 (MV Banglar Samriddhi)',
      spentBy: 'Jack Rahman',
      category: 'Towage & Harbor Pilotage',
      description: 'Harbor tugboat fuel surcharge dispatch reimbursement',
      date: '2026-11-15',
      amount: 2200.00,
      currency: 'USD',
      wallet: 'Towage & Berthing Reserve'
    },
    {
      id: 'exp_5',
      officeId: 'off_ctg_port',
      tenantId: 'ten_sst',
      fileProject: 'General Operations',
      spentBy: 'Rafiqul Islam',
      category: 'Office & Facilities',
      description: 'Port communication VHF radio maintenance and dock batteries',
      date: '2026-11-12',
      amount: 320.00,
      currency: 'USD',
      wallet: 'Operations Petty Cash'
    }
  ],
  officeRequisitions: [
    {
      id: 'req_1',
      officeId: 'off_ctg_port',
      tenantId: 'ten_sst',
      requisitionNo: 'REQ-2026-031',
      requestedBy: 'Jack Rahman',
      fileProject: 'PRJ-CTG-0042 (MV Meghna Harmony)',
      category: 'Port Operations',
      amount: 3500.00,
      purpose: 'Harbor tugboat advance fund for upcoming Maersk container call',
      date: '2026-11-23',
      status: 'Pending',
      wallet: 'Towage & Berthing Reserve'
    },
    {
      id: 'req_2',
      officeId: 'off_ctg_port',
      tenantId: 'ten_sst',
      requisitionNo: 'REQ-2026-030',
      requestedBy: 'Nusrat Jahan',
      fileProject: 'PRJ-CTG-0039 (MV Ocean Voyager)',
      category: 'Customs Clearance',
      amount: 1800.00,
      purpose: 'Advance treasury challan deposit for customs manifest filing',
      date: '2026-11-21',
      status: 'Approved',
      wallet: 'Port Authority Escrow'
    },
    {
      id: 'req_3',
      officeId: 'off_ctg_port',
      tenantId: 'ten_sst',
      requisitionNo: 'REQ-2026-029',
      requestedBy: 'Rafiqul Islam',
      fileProject: 'General Operations',
      category: 'Petty Cash',
      amount: 2000.00,
      purpose: 'Monthly office operational petty cash replenishment',
      date: '2026-11-15',
      status: 'Disbursed',
      wallet: 'Operations Petty Cash'
    }
  ],
  officeWallets: [
    {
      id: 'wlt_1',
      officeId: 'off_ctg_port',
      tenantId: 'ten_sst',
      name: 'Operations Petty Cash',
      balance: 4250.00,
      monthlyLimit: 10000.00,
      spentThisMonth: 2050.00,
      color: '#10B981',
      icon: 'dollar'
    },
    {
      id: 'wlt_2',
      officeId: 'off_ctg_port',
      tenantId: 'ten_sst',
      name: 'Port Authority Escrow',
      balance: 18500.00,
      monthlyLimit: 50000.00,
      spentThisMonth: 14850.00,
      color: '#3B82F6',
      icon: 'shield'
    },
    {
      id: 'wlt_3',
      officeId: 'off_ctg_port',
      tenantId: 'ten_sst',
      name: 'Towage & Berthing Reserve',
      balance: 9400.00,
      monthlyLimit: 25000.00,
      spentThisMonth: 7800.00,
      color: '#8B5CF6',
      icon: 'activity'
    }
  ]
};

class DataStore {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      // Clear legacy storage keys if present
      localStorage.removeItem('qrew_platform_state');
      localStorage.removeItem('qrew_platform_state_v2');
      localStorage.removeItem('qrew_platform_state_v3');

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Reset only if the stored shape is unusable (bump STORAGE_KEY when the seed changes)
        if (!Array.isArray(parsed.tenants) || !Array.isArray(parsed.offices) || !Array.isArray(parsed.users)) {
          return this.reset();
        }
        // Backward-compatibility guarantee: ensure new properties exist
        if (!parsed.departments || parsed.departments.length === 0) parsed.departments = JSON.parse(JSON.stringify(DEFAULT_DATA.departments || []));
        if (!parsed.departmentMembers || parsed.departmentMembers.length === 0) parsed.departmentMembers = JSON.parse(JSON.stringify(DEFAULT_DATA.departmentMembers || []));
        if (!parsed.officeConfigs || Object.keys(parsed.officeConfigs).length === 0) parsed.officeConfigs = JSON.parse(JSON.stringify(DEFAULT_DATA.officeConfigs || {}));
        if (!parsed.memberTasks || parsed.memberTasks.length === 0) parsed.memberTasks = JSON.parse(JSON.stringify(DEFAULT_DATA.memberTasks || []));
        if (!parsed.memberActivity || parsed.memberActivity.length === 0) parsed.memberActivity = JSON.parse(JSON.stringify(DEFAULT_DATA.memberActivity || []));
        if (!parsed.operationalFiles || parsed.operationalFiles.length === 0) parsed.operationalFiles = JSON.parse(JSON.stringify(DEFAULT_DATA.operationalFiles || []));
        if (!parsed.premadeDeliverables || parsed.premadeDeliverables.length === 0) parsed.premadeDeliverables = JSON.parse(JSON.stringify(DEFAULT_DATA.premadeDeliverables || []));
        if (!parsed.invoiceTemplates || parsed.invoiceTemplates.length === 0) parsed.invoiceTemplates = JSON.parse(JSON.stringify(DEFAULT_DATA.invoiceTemplates || []));
        if (!parsed.officeInvoices || parsed.officeInvoices.length === 0) parsed.officeInvoices = JSON.parse(JSON.stringify(DEFAULT_DATA.officeInvoices || []));
        if (!parsed.officeTransactions || parsed.officeTransactions.length === 0) parsed.officeTransactions = JSON.parse(JSON.stringify(DEFAULT_DATA.officeTransactions || []));
        if (!parsed.officeExpenses || parsed.officeExpenses.length === 0) parsed.officeExpenses = JSON.parse(JSON.stringify(DEFAULT_DATA.officeExpenses || []));
        if (!parsed.officeRequisitions || parsed.officeRequisitions.length === 0) parsed.officeRequisitions = JSON.parse(JSON.stringify(DEFAULT_DATA.officeRequisitions || []));
        if (!parsed.officeWallets || parsed.officeWallets.length === 0) parsed.officeWallets = JSON.parse(JSON.stringify(DEFAULT_DATA.officeWallets || []));
        return parsed;
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using initial dataset.', e);
    }
    this.saveData(DEFAULT_DATA);
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to write to localStorage', e);
    }
  }

  save() {
    this.saveData(this.data);
  }

  reset() {
    this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    this.save();
    return this.data;
  }

  // --- Current User ---
  getCurrentUser() {
    return this.data.currentUser;
  }

  setCurrentUser(userId) {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return null;
    this.data.currentUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      platformRole: user.platformRole,
      avatar: user.name.trim().charAt(0).toUpperCase()
    };
    this.save();
    return this.data.currentUser;
  }

  updateCurrentUser({ name, email }) {
    if (!name || !email) throw new Error('Name and email are required.');

    const oldName = this.data.currentUser.name;
    this.data.currentUser.name = name.trim();
    this.data.currentUser.email = email.trim();
    this.data.currentUser.avatar = name.trim().charAt(0).toUpperCase();

    // Synchronize in platform users directory
    const userInList = this.data.users.find(u => u.id === this.data.currentUser.id);
    if (userInList) {
      userInList.name = this.data.currentUser.name;
      userInList.email = this.data.currentUser.email;
    }

    this.addAuditLog(
      this.data.currentUser.name,
      'UPDATE',
      'Platform User',
      this.data.currentUser.id,
      `Updated user profile (Name: "${this.data.currentUser.name}", Email: "${this.data.currentUser.email}")`
    );

    this.save();
    return this.data.currentUser;
  }

  // --- Statistics ---
  getStats() {
    const totalTenants = this.data.tenants.length;
    const activeTenants = this.data.tenants.filter(t => t.status === 'Active').length;
    const totalOffices = this.data.offices.length;
    const totalUsers = this.data.users.length;
    return {
      totalTenants,
      activeTenants,
      totalOffices,
      totalUsers
    };
  }

  // --- Tenants ---
  getTenants() {
    return this.data.tenants.map(tenant => {
      const officeCount = this.data.offices.filter(o => o.tenantId === tenant.id).length;
      const memberCount = this.data.tenantMembers.filter(m => m.tenantId === tenant.id).length;
      return {
        ...tenant,
        officeCount,
        memberCount
      };
    });
  }

  getTenantById(id) {
    let tenant = this.data.tenants.find(t => t.id === id);
    // Graceful fallback for legacy ten_ctg or default single tenant
    if (!tenant && (id === 'ten_ctg' || !id || this.data.tenants.length === 1)) {
      tenant = this.data.tenants[0];
    }
    if (!tenant) return null;
    const offices = this.getOfficesByTenant(tenant.id);
    const members = this.getTenantMembers(tenant.id);
    return {
      ...tenant,
      offices,
      members,
      officeCount: offices.length,
      memberCount: members.length
    };
  }

  createTenant({ name, ownerName, ownerEmail, plan, status }) {
    const id = 'ten_' + name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 16) + '_' + Math.floor(Math.random() * 1000);
    const date = new Date().toISOString().split('T')[0];
    
    // Ensure owner exists as a user or create user
    let user = this.data.users.find(u => u.email.toLowerCase() === ownerEmail.toLowerCase() || u.name.toLowerCase() === ownerName.toLowerCase());

    // BUSINESS RULE: A Platform Owner cannot be assigned as a Tenant Admin or Tenant Owner
    if (user && user.platformRole === 'Platform Owner') {
      throw new Error(`Business Rule Violation: "${user.name}" is a Platform Owner. A Platform Owner cannot be a Tenant Admin or Tenant Owner.`);
    }

    if (!user) {
      user = {
        id: 'usr_' + Math.floor(Math.random() * 9000 + 1000),
        name: ownerName,
        email: ownerEmail,
        platformRole: 'Platform User',
        status: 'Active',
        createdAt: date
      };
      this.data.users.push(user);
    }

    const newTenant = {
      id,
      name,
      ownerName: user.name,
      ownerEmail: user.email,
      status: status || 'Active',
      plan: plan || 'Enterprise',
      createdAt: date
    };

    this.data.tenants.unshift(newTenant);

    // Make the owner a Tenant Admin
    this.data.tenantMembers.push({
      id: 'tm_' + Date.now() + '_' + Math.floor(Math.random() * 100),
      tenantId: id,
      userId: user.id,
      tenantRole: 'Tenant Admin',
      status: 'Active',
      joinedAt: date
    });

    this.addAuditLog(
      this.data.currentUser.name,
      'CREATE',
      'Tenant',
      id,
      `Created tenant "${name}" assigned to ${ownerName}`
    );

    this.save();
    return newTenant;
  }

  updateTenant(id, updates) {
    const tenant = this.data.tenants.find(t => t.id === id);
    if (!tenant) return null;

    const oldStatus = tenant.status;
    Object.assign(tenant, updates);

    let action = 'UPDATE';
    let desc = `Updated tenant "${tenant.name}" properties`;
    if (updates.status && updates.status !== oldStatus) {
      action = 'STATUS_CHANGE';
      desc = `${updates.status === 'Active' ? 'Activated' : 'Suspended'} tenant "${tenant.name}"`;
    }

    this.addAuditLog(
      this.data.currentUser.name,
      action,
      'Tenant',
      id,
      desc
    );

    this.save();
    return tenant;
  }

  deleteTenant(id) {
    const index = this.data.tenants.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Tenant not found');

    const tenant = this.data.tenants[index];

    // Cascade remove all offices, memberships, and staff under this tenant
    const tenantOfficeIds = this.data.offices.filter(o => o.tenantId === id).map(o => o.id);
    this.data.officeStaff = this.data.officeStaff.filter(os => !tenantOfficeIds.includes(os.officeId));
    this.data.offices = this.data.offices.filter(o => o.tenantId !== id);
    this.data.tenantMembers = this.data.tenantMembers.filter(tm => tm.tenantId !== id);

    // Remove tenant
    this.data.tenants.splice(index, 1);

    this.addAuditLog(
      this.data.currentUser.name,
      'DELETE',
      'Tenant',
      id,
      `Permanently deleted tenant organization "${tenant.name}"`
    );

    this.save();
    return true;
  }

  // --- Offices ---
  getOfficesByTenant(tenantId) {
    const targetId = (tenantId === 'ten_ctg' || !tenantId) ? 'ten_sst' : tenantId;
    return this.data.offices
      .filter(o => o.tenantId === targetId || o.tenantId === tenantId)
      .map(office => {
        const staffCount = this.data.officeStaff.filter(s => s.officeId === office.id).length;
        return {
          ...office,
          staffCount
        };
      });
  }

  getOfficeById(officeId) {
    let office = this.data.offices.find(o => o.id === officeId);
    if (!office && officeId === 'off_ctg_agr') {
      office = this.data.offices.find(o => o.id === 'off_mgl_port');
    }
    if (!office) return null;
    const tenant = this.data.tenants.find(t => t.id === office.tenantId);
    const staff = this.getOfficeStaff(office.id);
    return {
      ...office,
      tenant,
      staff,
      staffCount: staff.length
    };
  }

  createOffice(tenantId, { name, location }) {
    if (!tenantId) {
      throw new Error('Scope Violation: An office can only be created under an explicit tenant organization.');
    }
    const tenant = this.data.tenants.find(t => t.id === tenantId);
    if (!tenant) throw new Error('Parent tenant not found.');

    const id = 'off_' + name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 14) + '_' + Math.floor(Math.random() * 1000);
    const date = new Date().toISOString().split('T')[0];

    const newOffice = {
      id,
      tenantId,
      name,
      location: location || 'Headquarters',
      status: 'Active',
      createdAt: date
    };

    this.data.offices.push(newOffice);

    this.addAuditLog(
      this.data.currentUser.name,
      'CREATE',
      'Office',
      id,
      `Created office "${name}" under tenant "${tenant.name}"`
    );

    this.save();
    return newOffice;
  }

  updateOffice(officeId, updates, tenantId) {
    const office = this.data.offices.find(o => o.id === officeId);
    if (!office) throw new Error('Office not found');

    if (tenantId && office.tenantId !== tenantId) {
      throw new Error('Scope Violation: Office does not belong to the specified tenant organization.');
    }

    const oldStatus = office.status;
    const safeUpdates = { ...updates };
    delete safeUpdates.tenantId;
    delete safeUpdates.id;

    Object.assign(office, safeUpdates);

    let action = 'UPDATE';
    let desc = `Updated office "${office.name}" information`;
    if (updates.status && updates.status !== oldStatus) {
      action = 'STATUS_CHANGE';
      desc = `${updates.status === 'Active' ? 'Activated' : 'Suspended'} office "${office.name}"`;
    }

    this.addAuditLog(
      this.data.currentUser.name,
      action,
      'Office',
      officeId,
      desc
    );

    this.save();
    return office;
  }

  deleteOffice(officeId, tenantId) {
    const index = this.data.offices.findIndex(o => o.id === officeId);
    if (index === -1) throw new Error('Office not found');

    const office = this.data.offices[index];
    if (tenantId && office.tenantId !== tenantId) {
      throw new Error('Scope Violation: Office does not belong to the specified tenant organization.');
    }

    // Cascade remove all office staff
    this.data.officeStaff = this.data.officeStaff.filter(os => os.officeId !== officeId);

    // Remove office
    this.data.offices.splice(index, 1);

    this.addAuditLog(
      this.data.currentUser.name,
      'DELETE',
      'Office',
      officeId,
      `Deleted office branch "${office.name}"`
    );

    this.save();
    return true;
  }

  // --- Tenant Members ---
  getTenantMembers(tenantId) {
    const targetId = (tenantId === 'ten_ctg' || !tenantId) ? 'ten_sst' : tenantId;
    return this.data.tenantMembers
      .filter(tm => tm.tenantId === targetId || tm.tenantId === tenantId)
      .map(tm => {
        const user = this.data.users.find(u => u.id === tm.userId);
        return {
          ...tm,
          user: user || { id: tm.userId, name: 'Unknown User', email: 'unknown@qrew.io' }
        };
      });
  }

  addTenantMember(tenantId, { userId, name, email, tenantRole }) {
    const tenant = this.data.tenants.find(t => t.id === tenantId);
    if (!tenant) throw new Error('Tenant not found');

    let user;
    if (userId) {
      user = this.data.users.find(u => u.id === userId);
    } else if (email) {
      user = this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        user = {
          id: 'usr_' + Math.floor(Math.random() * 9000 + 1000),
          name: name || email.split('@')[0],
          email: email,
          platformRole: 'Platform User',
          status: 'Active',
          createdAt: new Date().toISOString().split('T')[0]
        };
        this.data.users.push(user);
      }
    }

    if (!user) throw new Error('User selection or valid email is required.');

    // BUSINESS RULE: A Platform Owner cannot be assigned as a Tenant Admin
    if (user.platformRole === 'Platform Owner' && (tenantRole === 'Tenant Admin' || !tenantRole)) {
      throw new Error(`Business Rule Violation: "${user.name}" is a Platform Owner. A Platform Owner cannot be assigned as a Tenant Admin.`);
    }

    // Check if already a member of this tenant
    const existing = this.data.tenantMembers.find(m => m.tenantId === tenantId && m.userId === user.id);
    if (existing) {
      throw new Error(`"${user.name}" is already a member of this tenant.`);
    }

    const newMember = {
      id: 'tm_' + Date.now(),
      tenantId,
      userId: user.id,
      tenantRole: tenantRole || 'Tenant Member',
      status: 'Active',
      joinedAt: new Date().toISOString().split('T')[0]
    };

    this.data.tenantMembers.push(newMember);

    this.addAuditLog(
      this.data.currentUser.name,
      'ADD_MEMBER',
      'Tenant Member',
      tenantId,
      `Added "${user.name}" as ${newMember.tenantRole} to tenant "${tenant.name}"`
    );

    this.save();
    return { ...newMember, user };
  }

  updateTenantMemberRole(tenantId, userId, newRole) {
    const member = this.data.tenantMembers.find(m => m.tenantId === tenantId && m.userId === userId);
    if (!member) throw new Error('Tenant membership not found.');
    
    const user = this.data.users.find(u => u.id === userId);

    // BUSINESS RULE: A Platform Owner cannot be assigned as a Tenant Admin
    if (user && user.platformRole === 'Platform Owner' && newRole === 'Tenant Admin') {
      throw new Error(`Business Rule Violation: "${user.name}" is a Platform Owner and cannot hold the Tenant Admin role.`);
    }

    const tenant = this.data.tenants.find(t => t.id === tenantId);
    const oldRole = member.tenantRole;
    member.tenantRole = newRole;

    this.addAuditLog(
      this.data.currentUser.name,
      'ASSIGN_ROLE',
      'Tenant Member',
      tenantId,
      `Changed role of "${user ? user.name : userId}" from "${oldRole}" to "${newRole}" in tenant "${tenant ? tenant.name : tenantId}"`
    );

    this.save();
    return member;
  }

  removeTenantMember(tenantId, userId) {
    const memberIndex = this.data.tenantMembers.findIndex(m => m.tenantId === tenantId && m.userId === userId);
    if (memberIndex === -1) throw new Error('Tenant member not found.');

    const user = this.data.users.find(u => u.id === userId);
    const tenant = this.data.tenants.find(t => t.id === tenantId);

    // Business rule cascade: When removed from tenant, also remove from all offices belonging to that tenant!
    const tenantOffices = this.data.offices.filter(o => o.tenantId === tenantId).map(o => o.id);
    this.data.officeStaff = this.data.officeStaff.filter(os => !(tenantOffices.includes(os.officeId) && os.userId === userId));

    this.data.tenantMembers.splice(memberIndex, 1);

    this.addAuditLog(
      this.data.currentUser.name,
      'DELETE',
      'Tenant Member',
      tenantId,
      `Removed "${user ? user.name : userId}" from tenant "${tenant ? tenant.name : tenantId}" and associated offices`
    );

    this.save();
    return true;
  }

  // --- Office Staff ---
  getOfficeStaff(officeId) {
    return this.data.officeStaff
      .filter(os => os.officeId === officeId)
      .map(os => {
        const user = this.data.users.find(u => u.id === os.userId);
        return {
          ...os,
          user: user || { id: os.userId, name: 'Unknown User', email: 'unknown@qrew.io' }
        };
      });
  }

  /**
   * CRITICAL BUSINESS RULE:
   * Only users who are ALREADY members of the parent tenant can be added as office staff!
   */
  getEligibleUsersForOffice(officeId) {
    const office = this.data.offices.find(o => o.id === officeId);
    if (!office) return [];

    // 1. Get all members of the parent tenant
    const tenantMembers = this.getTenantMembers(office.tenantId);

    // 2. Filter out users who are already assigned to this specific office
    const existingStaffUserIds = this.data.officeStaff
      .filter(os => os.officeId === officeId)
      .map(os => os.userId);

    return tenantMembers
      .filter(tm => !existingStaffUserIds.includes(tm.userId))
      .map(tm => ({
        userId: tm.userId,
        name: tm.user.name,
        email: tm.user.email,
        tenantRole: tm.tenantRole
      }));
  }

  addOfficeStaff(officeId, { userId, name, email, officeRole }) {
    const office = this.data.offices.find(o => o.id === officeId);
    if (!office) throw new Error('Office not found');

    let user;
    if (userId) {
      user = this.data.users.find(u => u.id === userId);
    } else if (name && name.trim()) {
      const cleanName = name.trim();
      user = this.data.users.find(u => u.name.toLowerCase() === cleanName.toLowerCase());
      if (!user) {
        const slug = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '.');
        const tenant = this.data.tenants.find(t => t.id === office.tenantId);
        const domain = tenant ? tenant.name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'qrew';
        user = {
          id: 'usr_' + Math.floor(Math.random() * 9000 + 1000),
          name: cleanName,
          email: email || `${slug}@${domain}.io`,
          platformRole: 'Platform User',
          status: 'Active',
          createdAt: new Date().toISOString().split('T')[0]
        };
        this.data.users.push(user);
      }
    }

    if (!user) {
      throw new Error('Staff name is required.');
    }

    // Ensure user is enrolled in the parent tenant organization
    const isTenantMember = this.data.tenantMembers.some(
      tm => tm.tenantId === office.tenantId && tm.userId === user.id
    );

    if (!isTenantMember) {
      this.data.tenantMembers.push({
        id: 'tm_' + Date.now(),
        tenantId: office.tenantId,
        userId: user.id,
        tenantRole: 'Tenant Member',
        status: 'Active',
        joinedAt: new Date().toISOString().split('T')[0]
      });
    }

    // Check if already in office
    const existing = this.data.officeStaff.find(os => os.officeId === officeId && os.userId === user.id);
    if (existing) {
      throw new Error(`"${user.name}" is already assigned as staff in this office.`);
    }

    const newStaff = {
      id: 'os_' + Date.now(),
      officeId,
      tenantId: office.tenantId,
      userId: user.id,
      officeRole: officeRole || 'Office Staff',
      status: 'Active',
      assignedAt: new Date().toISOString().split('T')[0]
    };

    this.data.officeStaff.push(newStaff);

    this.addAuditLog(
      this.data.currentUser.name,
      'ASSIGN_ROLE',
      'Office Staff',
      officeId,
      `Assigned "${user.name}" as ${newStaff.officeRole} in office "${office.name}"`
    );

    this.save();
    return { ...newStaff, user };
  }

  updateOfficeStaffRole(officeId, userId, newRole) {
    const staff = this.data.officeStaff.find(s => s.officeId === officeId && s.userId === userId);
    if (!staff) throw new Error('Staff member not found in this office.');

    const user = this.data.users.find(u => u.id === userId);
    const office = this.data.offices.find(o => o.id === officeId);
    const oldRole = staff.officeRole;
    staff.officeRole = newRole;

    this.addAuditLog(
      this.data.currentUser.name,
      'ASSIGN_ROLE',
      'Office Staff',
      officeId,
      `Changed office role of "${user ? user.name : userId}" from "${oldRole}" to "${newRole}" at "${office ? office.name : officeId}"`
    );

    this.save();
    return staff;
  }

  removeOfficeStaff(officeId, userId) {
    const index = this.data.officeStaff.findIndex(s => s.officeId === officeId && s.userId === userId);
    if (index === -1) throw new Error('Staff record not found.');

    const user = this.data.users.find(u => u.id === userId);
    const office = this.data.offices.find(o => o.id === officeId);

    this.data.officeStaff.splice(index, 1);

    this.addAuditLog(
      this.data.currentUser.name,
      'DELETE',
      'Office Staff',
      officeId,
      `Removed "${user ? user.name : userId}" from office "${office ? office.name : officeId}"`
    );

    this.save();
    return true;
  }

  // --- Platform Users ---
  getPlatformUsers() {
    return this.data.users.map(u => {
      // Calculate active tenant memberships
      const tenantCount = this.data.tenantMembers.filter(tm => tm.userId === u.id).length;
      return {
        ...u,
        tenantCount
      };
    });
  }

  getUsers() {
    return this.getPlatformUsers();
  }

  getUserById(userId) {
    return this.getUserDetails(userId);
  }

  getUserDetails(userId) {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return null;

    const tenantMemberships = this.data.tenantMembers
      .filter(tm => tm.userId === userId)
      .map(tm => {
        const tenant = this.data.tenants.find(t => t.id === tm.tenantId);
        return {
          ...tm,
          tenantName: tenant ? tenant.name : tm.tenantId
        };
      });

    const officeAssignments = this.data.officeStaff
      .filter(os => os.userId === userId)
      .map(os => {
        const office = this.data.offices.find(o => o.id === os.officeId);
        const tenant = this.data.tenants.find(t => t.id === os.tenantId);
        return {
          ...os,
          officeName: office ? office.name : os.officeId,
          tenantName: tenant ? tenant.name : os.tenantId
        };
      });

    return {
      ...user,
      tenantMemberships,
      officeAssignments
    };
  }

  createPlatformUser({ name, email, platformRole }) {
    const existing = this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) throw new Error('A user with this email address already exists.');

    const newUser = {
      id: 'usr_' + Math.floor(Math.random() * 9000 + 1000),
      name,
      email,
      platformRole: platformRole || 'Platform User',
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0]
    };

    this.data.users.unshift(newUser);

    this.addAuditLog(
      this.data.currentUser.name,
      'CREATE',
      'Platform User',
      newUser.id,
      `Created platform user "${name}" (${email}) with role ${newUser.platformRole}`
    );

    this.save();
    return newUser;
  }

  updatePlatformUser(userId, updates) {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return null;

    // BUSINESS RULE: A Tenant Admin cannot be made a Platform Owner
    if (updates.platformRole === 'Platform Owner') {
      const isTenantAdmin = this.data.tenantMembers.some(tm => tm.userId === userId && tm.tenantRole === 'Tenant Admin');
      if (isTenantAdmin) {
        throw new Error(`Business Rule Violation: "${user.name}" is currently a Tenant Admin in an organization and cannot be assigned the Platform Owner role.`);
      }
    }

    const oldRole = user.platformRole;
    const oldStatus = user.status;
    Object.assign(user, updates);

    let action = 'UPDATE';
    let desc = `Updated user "${user.name}" profile`;

    if (updates.platformRole && updates.platformRole !== oldRole) {
      action = 'ASSIGN_ROLE';
      desc = `Changed platform role of "${user.name}" from "${oldRole}" to "${updates.platformRole}"`;
    } else if (updates.status && updates.status !== oldStatus) {
      action = 'STATUS_CHANGE';
      desc = `${updates.status === 'Active' ? 'Activated' : 'Deactivated'} platform user "${user.name}"`;
    }

    this.addAuditLog(
      this.data.currentUser.name,
      action,
      'Platform User',
      userId,
      desc
    );

    this.save();
    return user;
  }

  // --- Roles & Permissions ---
  getRoles(level) {
    if (level && this.data.roles[level]) {
      return this.data.roles[level];
    }
    return this.data.roles;
  }

  // Count assigned members to a specific role
  getAssignedCountForRole(roleName, level) {
    if (level === 'platform') {
      return this.data.users.filter(u => u.platformRole === roleName).length;
    } else if (level === 'tenant') {
      return this.data.tenantMembers.filter(tm => tm.tenantRole === roleName).length;
    } else if (level === 'office') {
      return this.data.officeStaff.filter(os => os.officeRole === roleName).length;
    }
    return 0;
  }

  // --- Audit Logs ---
  getAuditLogs() {
    return [...this.data.auditLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  getAuditLogsByTenant(tenantId) {
    const targetId = (tenantId === 'ten_ctg' || !tenantId) ? 'ten_sst' : tenantId;
    const tenantOffices = this.data.offices.filter(o => o.tenantId === targetId).map(o => o.id);
    return this.getAuditLogs().filter(log => log.resourceId === targetId || tenantOffices.includes(log.resourceId));
  }

  getAuditLogsByOffice(officeId) {
    return this.getAuditLogs().filter(log => log.resourceId === officeId || (log.description && log.description.toLowerCase().includes(officeId.toLowerCase())));
  }

  addAuditLog(actor, action, resourceType, resourceId, description) {
    const pad = (n) => String(n).padStart(2, '0');
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    
    const newLog = {
      id: 'LOG-' + Math.floor(Math.random() * 90000 + 10000),
      actor: actor || this.data.currentUser.name,
      action,
      resourceType,
      resourceId,
      description,
      timestamp
    };

    this.data.auditLogs.unshift(newLog);
    // Keep max 200 logs in storage
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs.pop();
    }

    this.save();
    return newLog;
  }

  // ==========================================
  // Office Configuration Centre (Interface 4)
  // ==========================================
  getOfficeConfig(officeId) {
    if (!this.data.officeConfigs) this.data.officeConfigs = {};
    if (this.data.officeConfigs[officeId]) {
      return { ...this.data.officeConfigs[officeId] };
    }
    // Return sensible fallback config if not yet customized
    const office = this.getOfficeById(officeId);
    const officeName = office ? office.name : 'Branch';
    return {
      code: (officeName.slice(0, 3).toUpperCase()) + '-01',
      tier: 'Standard Branch Facility',
      floorArea: '5,000 sq ft',
      maxOccupancy: 50,
      operatingHours: '09:00 - 18:00 (Standard Shift)',
      primaryContact: '+880 31 000000',
      emergencyContact: '+880 31 999999',
      shifts: ['Standard Day (09:00 - 18:00)'],
      checkInGrace: '15 mins',
      accessControlMode: 'Smart Card RFID'
    };
  }

  saveOfficeConfig(officeId, specs) {
    if (!this.data.officeConfigs) this.data.officeConfigs = {};
    this.data.officeConfigs[officeId] = {
      ...this.getOfficeConfig(officeId),
      ...specs
    };

    const office = this.getOfficeById(officeId);
    const officeName = office ? office.name : officeId;
    this.addAuditLog(
      this.data.currentUser.name,
      'UPDATE_CONFIG',
      'Office Facility',
      officeId,
      `Updated facility specifications and operational parameters for "${officeName}"`
    );

    this.save();
    return this.data.officeConfigs[officeId];
  }

  // ==========================================
  // Department Management & Provisioning (Interfaces 4, 5, 6)
  // ==========================================
  getDepartments(officeId = null) {
    if (!this.data.departments) this.data.departments = [];
    if (officeId) {
      return this.data.departments.filter(d => d.officeId === officeId);
    }
    return [...this.data.departments];
  }

  getDepartmentById(deptId) {
    if (!this.data.departments) this.data.departments = [];
    return this.data.departments.find(d => d.id === deptId) || null;
  }

  createDepartment(deptData) {
    if (!this.data.departments) this.data.departments = [];
    const id = 'dept_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4);
    const newDept = {
      id,
      officeId: deptData.officeId,
      name: (deptData.name || '').trim(),
      code: (deptData.code || 'GEN').toUpperCase().trim(),
      leadName: (deptData.leadName || 'Unassigned').trim(),
      capacity: parseInt(deptData.capacity, 10) || 10,
      status: deptData.status || 'Active',
      description: (deptData.description || '').trim(),
      createdAt: new Date().toISOString().split('T')[0]
    };

    this.data.departments.push(newDept);

    const office = this.getOfficeById(deptData.officeId);
    this.addAuditLog(
      this.data.currentUser.name,
      'CREATE_DEPT',
      'Department',
      id,
      `Provisioned department "${newDept.name}" [${newDept.code}] at ${office ? office.name : deptData.officeId}`
    );

    this.save();
    return newDept;
  }

  updateDepartment(deptId, updates) {
    const dept = this.getDepartmentById(deptId);
    if (!dept) throw new Error('Department not found');

    if (updates.name) dept.name = updates.name.trim();
    if (updates.code) dept.code = updates.code.toUpperCase().trim();
    if (updates.leadName) dept.leadName = updates.leadName.trim();
    if (updates.capacity) dept.capacity = parseInt(updates.capacity, 10);
    if (updates.status) dept.status = updates.status;
    if (updates.description !== undefined) dept.description = updates.description.trim();

    this.addAuditLog(
      this.data.currentUser.name,
      'UPDATE_DEPT',
      'Department',
      deptId,
      `Updated settings for department "${dept.name}"`
    );

    this.save();
    return dept;
  }

  deleteDepartment(deptId) {
    const dept = this.getDepartmentById(deptId);
    if (!dept) throw new Error('Department not found');

    const deptName = dept.name;
    this.data.departments = this.data.departments.filter(d => d.id !== deptId);
    // Remove linked department members
    if (this.data.departmentMembers) {
      this.data.departmentMembers = this.data.departmentMembers.filter(dm => dm.deptId !== deptId);
    }

    this.addAuditLog(
      this.data.currentUser.name,
      'DELETE_DEPT',
      'Department',
      deptId,
      `Deprovisioned department "${deptName}" and reallocated roster`
    );

    this.save();
    return true;
  }

  // ==========================================
  // Department Members (Interface 6)
  // ==========================================
  getDepartmentMembers(deptId = null) {
    if (!this.data.departmentMembers) this.data.departmentMembers = [];
    if (deptId) {
      return this.data.departmentMembers.filter(dm => dm.deptId === deptId).map(dm => {
        const user = this.getUserById(dm.userId) || { name: 'Unknown User', email: '', platformRole: 'Staff' };
        return { ...dm, user };
      });
    }
    return this.data.departmentMembers.map(dm => {
      const user = this.getUserById(dm.userId) || { name: 'Unknown User', email: '', platformRole: 'Staff' };
      return { ...dm, user };
    });
  }

  addDepartmentMember(deptId, userId, deptRole = 'Staff Specialist', shift = 'Standard Day (09:00 - 18:00)') {
    if (!this.data.departmentMembers) this.data.departmentMembers = [];
    const existing = this.data.departmentMembers.find(dm => dm.deptId === deptId && dm.userId === userId);
    if (existing) {
      existing.deptRole = deptRole;
      existing.shift = shift;
      this.save();
      return existing;
    }

    const id = 'dm_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4);
    const newAssignment = {
      id,
      deptId,
      userId,
      deptRole,
      shift,
      status: 'On Duty'
    };
    this.data.departmentMembers.push(newAssignment);

    const user = this.getUserById(userId);
    const dept = this.getDepartmentById(deptId);
    this.addAuditLog(
      this.data.currentUser.name,
      'ASSIGN_DEPT_MEMBER',
      'Department Member',
      id,
      `Assigned ${user ? user.name : userId} to ${dept ? dept.name : deptId} as ${deptRole}`
    );

    this.save();
    return newAssignment;
  }

  removeDepartmentMember(memberId) {
    if (!this.data.departmentMembers) return false;
    const member = this.data.departmentMembers.find(m => m.id === memberId);
    if (!member) return false;

    const user = this.getUserById(member.userId);
    const dept = this.getDepartmentById(member.deptId);

    this.data.departmentMembers = this.data.departmentMembers.filter(m => m.id !== memberId);
    this.addAuditLog(
      this.data.currentUser.name,
      'REMOVE_DEPT_MEMBER',
      'Department Member',
      memberId,
      `Removed ${user ? user.name : 'Member'} from ${dept ? dept.name : 'Department'}`
    );

    this.save();
    return true;
  }

  // ==========================================
  // Member Workspace Tasks & Activity (Interface 7)
  // ==========================================
  getMemberTasks(userId = null) {
    if (!this.data.memberTasks) this.data.memberTasks = [];
    if (userId) {
      return this.data.memberTasks.filter(t => t.userId === userId);
    }
    return [...this.data.memberTasks];
  }

  getTasksByDepartment(deptId) {
    if (!this.data.memberTasks) this.data.memberTasks = [];
    return this.data.memberTasks.filter(t => t.deptId === deptId);
  }

  toggleTaskStatus(taskId) {
    if (!this.data.memberTasks) return null;
    const task = this.data.memberTasks.find(t => t.id === taskId);
    if (!task) return null;

    task.status = (task.status === 'Completed') ? 'In Progress' : 'Completed';
    this.addMemberActivity(
      task.userId,
      task.status === 'Completed' ? 'Task Completed' : 'Task Reopened',
      `Marked task "${task.title}" as ${task.status}`,
      'task'
    );

    this.save();
    return task;
  }

  createMemberTask(userId, deptId, title, priority = 'Normal', dueTime = 'Today', category = 'Operations') {
    if (!this.data.memberTasks) this.data.memberTasks = [];
    const id = 'tsk_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4);
    const newTask = {
      id,
      userId,
      deptId,
      title: title.trim(),
      priority,
      dueTime,
      category,
      status: 'Pending'
    };
    this.data.memberTasks.unshift(newTask);

    this.addMemberActivity(
      userId,
      'New Task Assigned',
      `Assigned task: "${newTask.title}" [${priority} Priority]`,
      'task'
    );

    this.save();
    return newTask;
  }

  getMemberActivities(userId) {
    if (!this.data.memberActivity) this.data.memberActivity = [];
    return this.data.memberActivity.filter(a => a.userId === userId);
  }

  addMemberActivity(userId, title, description, type = 'general') {
    if (!this.data.memberActivity) this.data.memberActivity = [];
    const pad = (n) => String(n).padStart(2, '0');
    const now = new Date();
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    
    const newActivity = {
      id: 'act_' + Date.now().toString(36),
      userId,
      title,
      description,
      timestamp: `Today, ${timeStr}`,
      type
    };
    this.data.memberActivity.unshift(newActivity);
    if (this.data.memberActivity.length > 50) this.data.memberActivity.pop();
    this.save();
    return newActivity;
  }

  // Operational Files (Projects & Products)
  getOperationalFiles(officeId = null, type = null) {
    if (!this.data.operationalFiles) this.data.operationalFiles = [];
    return this.data.operationalFiles.filter(f => {
      const matchOffice = !officeId || f.officeId === officeId;
      const matchType = !type || type === 'all' || f.type === type;
      return matchOffice && matchType;
    });
  }

  getOperationalFileById(fileId) {
    if (!this.data.operationalFiles) this.data.operationalFiles = [];
    return this.data.operationalFiles.find(f => f.id === fileId) || null;
  }

  // Premade Deliverables Library
  getPremadeDeliverables() {
    if (!this.data.premadeDeliverables) this.data.premadeDeliverables = [];
    return JSON.parse(JSON.stringify(this.data.premadeDeliverables));
  }

  // Invoice Templates
  getInvoiceTemplates(officeId = null) {
    if (!this.data.invoiceTemplates) this.data.invoiceTemplates = [];
    let list = this.data.invoiceTemplates;
    if (officeId) {
      list = list.filter(t => t.officeId === officeId);
    }
    return JSON.parse(JSON.stringify(list));
  }

  getInvoiceTemplateById(templateId) {
    if (!this.data.invoiceTemplates) this.data.invoiceTemplates = [];
    const found = this.data.invoiceTemplates.find(t => t.id === templateId);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  createInvoiceTemplate(officeId, templateData) {
    if (!this.data.invoiceTemplates) this.data.invoiceTemplates = [];
    const office = this.getOfficeById(officeId);
    const tenantId = office ? office.tenantId : 'ten_sst';
    const id = 'tpl_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4);
    
    // Auto-generate code if missing
    const count = this.data.invoiceTemplates.filter(t => t.officeId === officeId).length + 1;
    const prefix = office ? office.name.substring(0, 3).toUpperCase() : 'OFF';
    const code = templateData.code || `SST-${prefix}-INV-${String(count).padStart(2, '0')}`;
    
    // If setting as default, clear others in this office
    if (templateData.isDefault) {
      this.data.invoiceTemplates.forEach(t => {
        if (t.officeId === officeId) t.isDefault = false;
      });
    }

    const newTemplate = {
      id,
      officeId,
      tenantId,
      name: templateData.name || 'Untitled Invoice Template',
      code,
      status: templateData.status || 'Active',
      isDefault: Boolean(templateData.isDefault),
      currency: templateData.currency || 'USD',
      currencySymbol: templateData.currencySymbol || '$',
      clientName: templateData.clientName || '',
      clientCode: templateData.clientCode || '',
      billingTerms: templateData.billingTerms || 'Net 30',
      sourceFileId: templateData.sourceFileId || null,
      sourceFileType: templateData.sourceFileType || null,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      globalConstants: templateData.globalConstants || { BASE_VAT: 0.15, PORT_SURCHARGE: 0.05, DOLLAR_RATE: 120.50 },
      localConstants: templateData.localConstants || { SETUP_FEE: 250.00 },
      sections: templateData.sections || [
        {
          id: 'sec_1',
          title: 'Section 1: General Deliverables',
          rows: [
            { id: 'r1', token: 'ITEM_1', name: 'Primary Operational Service', equation: '1000.00' }
          ],
          subtotal: { token: 'SEC1_TOTAL', label: 'Section Total', equation: '= ITEM_1' }
        }
      ],
      grandTotal: templateData.grandTotal || {
        token: 'GRAND_TOTAL',
        label: '*** GRAND TOTAL (Balance Due)',
        equation: '= SEC1_TOTAL * (1 + BASE_VAT)'
      }
    };

    this.data.invoiceTemplates.unshift(newTemplate);
    this.addAuditLog(
      'CREATE_TEMPLATE',
      'Invoice Template',
      newTemplate.id,
      `Created invoice template "${newTemplate.name}" (${newTemplate.code}) for office ${office ? office.name : officeId}`
    );
    this.save();
    return JSON.parse(JSON.stringify(newTemplate));
  }

  updateInvoiceTemplate(id, templateData) {
    if (!this.data.invoiceTemplates) this.data.invoiceTemplates = [];
    const idx = this.data.invoiceTemplates.findIndex(t => t.id === id);
    if (idx === -1) throw new Error(`Invoice template ${id} not found.`);

    const existing = this.data.invoiceTemplates[idx];
    const officeId = existing.officeId;

    if (templateData.isDefault && !existing.isDefault) {
      this.data.invoiceTemplates.forEach(t => {
        if (t.officeId === officeId && t.id !== id) t.isDefault = false;
      });
    }

    const updated = {
      ...existing,
      ...templateData,
      id,
      officeId,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    this.data.invoiceTemplates[idx] = updated;
    this.addAuditLog(
      'UPDATE_TEMPLATE',
      'Invoice Template',
      id,
      `Updated invoice template "${updated.name}" (${updated.code})`
    );
    this.save();
    return JSON.parse(JSON.stringify(updated));
  }

  duplicateInvoiceTemplate(id) {
    const original = this.getInvoiceTemplateById(id);
    if (!original) throw new Error(`Invoice template ${id} not found.`);

    const count = this.data.invoiceTemplates.filter(t => t.officeId === original.officeId).length + 1;
    const clonedData = JSON.parse(JSON.stringify(original));
    clonedData.name = `${original.name} (Copy)`;
    clonedData.code = `${original.code}-CPY${count}`;
    clonedData.isDefault = false;

    return this.createInvoiceTemplate(original.officeId, clonedData);
  }

  deleteInvoiceTemplate(id) {
    if (!this.data.invoiceTemplates) return false;
    const idx = this.data.invoiceTemplates.findIndex(t => t.id === id);
    if (idx === -1) return false;

    const removed = this.data.invoiceTemplates.splice(idx, 1)[0];
    this.addAuditLog(
      'DELETE_TEMPLATE',
      'Invoice Template',
      id,
      `Deleted invoice template "${removed.name}" (${removed.code})`
    );
    this.save();
    return true;
  }

  archiveInvoiceTemplate(id) {
    const updated = this.updateInvoiceTemplate(id, { status: 'Archived' });
    this.addAuditLog(
      'ARCHIVE_TEMPLATE',
      'Invoice Template',
      id,
      `Archived invoice template "${updated.name}" (${updated.code})`
    );
    return updated;
  }

  unarchiveInvoiceTemplate(id) {
    const updated = this.updateInvoiceTemplate(id, { status: 'Active' });
    this.addAuditLog(
      'UNARCHIVE_TEMPLATE',
      'Invoice Template',
      id,
      `Restored invoice template "${updated.name}" (${updated.code}) to active status`
    );
    return updated;
  }

  setDefaultInvoiceTemplate(officeId, id) {
    if (!this.data.invoiceTemplates) return;
    this.data.invoiceTemplates.forEach(t => {
      if (t.officeId === officeId) {
        t.isDefault = (t.id === id);
      }
    });
    this.addAuditLog(
      'SET_DEFAULT_TEMPLATE',
      'Invoice Template',
      id,
      `Set invoice template ${id} as default for office ${officeId}`
    );
    this.save();
  }

  // Office Financial Invoices
  getOfficeInvoices(officeId = null) {
    if (!this.data.officeInvoices) this.data.officeInvoices = [];
    let list = this.data.officeInvoices;
    if (officeId) {
      list = list.filter(i => i.officeId === officeId);
    }
    return JSON.parse(JSON.stringify(list));
  }

  getOfficeInvoiceById(id) {
    if (!this.data.officeInvoices) this.data.officeInvoices = [];
    const found = this.data.officeInvoices.find(i => i.id === id);
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  createOfficeInvoice(officeId, data) {
    if (!this.data.officeInvoices) this.data.officeInvoices = [];
    const office = this.getOfficeById(officeId);
    const tenantId = office ? office.tenantId : 'ten_sst';
    const count = this.data.officeInvoices.length + 1;
    const invoiceNo = data.invoiceNo || `INV-2026-${String(count).padStart(3, '0')}`;
    const id = 'inv_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4);

    const newInvoice = {
      id,
      officeId,
      tenantId,
      invoiceNo,
      clientName: data.clientName || 'General Shipping Client',
      clientCode: data.clientCode || 'GEN-CLT',
      vessel: data.vessel || 'Vessel Port Call',
      voyageNo: data.voyageNo || 'V-2026',
      issueDate: data.issueDate || new Date().toISOString().split('T')[0],
      dueDate: data.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      amount: parseFloat(data.amount) || 0,
      currency: data.currency || 'USD',
      currencySymbol: data.currencySymbol || '$',
      status: data.status || 'Pending',
      items: data.items && data.items.length ? data.items : [
        { name: data.description || 'Maritime Operational Services', amount: parseFloat(data.amount) || 0 }
      ],
      notes: data.notes || 'Created via Financials Hub.'
    };

    this.data.officeInvoices.unshift(newInvoice);
    this.addAuditLog(
      'CREATE_INVOICE',
      'Office Invoice',
      newInvoice.id,
      `Issued invoice "${newInvoice.invoiceNo}" for ${newInvoice.clientName} (${newInvoice.currencySymbol}${newInvoice.amount.toLocaleString()})`
    );
    this.save();
    return JSON.parse(JSON.stringify(newInvoice));
  }

  updateOfficeInvoiceStatus(id, status, paidDate = null) {
    if (!this.data.officeInvoices) this.data.officeInvoices = [];
    const idx = this.data.officeInvoices.findIndex(i => i.id === id);
    if (idx === -1) throw new Error(`Invoice ${id} not found.`);

    const existing = this.data.officeInvoices[idx];
    existing.status = status;
    if (status === 'Paid') {
      existing.paidDate = paidDate || new Date().toISOString().split('T')[0];
    }
    this.addAuditLog(
      'UPDATE_INVOICE_STATUS',
      'Office Invoice',
      id,
      `Updated invoice "${existing.invoiceNo}" status to ${status}`
    );
    this.save();
    return JSON.parse(JSON.stringify(existing));
  }

  deleteOfficeInvoice(id) {
    if (!this.data.officeInvoices) this.data.officeInvoices = [];
    const idx = this.data.officeInvoices.findIndex(i => i.id === id);
    if (idx === -1) return false;
    const removed = this.data.officeInvoices.splice(idx, 1)[0];
    this.addAuditLog(
      'DELETE_INVOICE',
      'Office Invoice',
      id,
      `Deleted invoice "${removed.invoiceNo}"`
    );
    this.save();
    return true;
  }

  // Office Financial Transactions
  getOfficeTransactions(officeId = null) {
    if (!this.data.officeTransactions) this.data.officeTransactions = [];
    let list = this.data.officeTransactions;
    if (officeId) {
      list = list.filter(t => t.officeId === officeId);
    }
    return JSON.parse(JSON.stringify(list));
  }

  createOfficeTransaction(officeId, data) {
    if (!this.data.officeTransactions) this.data.officeTransactions = [];
    const office = this.getOfficeById(officeId);
    const tenantId = office ? office.tenantId : 'ten_sst';
    const id = 'txn_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4);
    const count = this.data.officeTransactions.length + 1;
    const reference = data.reference || `TXN-88${String(count).padStart(3, '0')}`;

    const newTxn = {
      id,
      officeId,
      tenantId,
      date: data.date || new Date().toISOString().split('T')[0],
      reference,
      type: data.type || 'Credit', // Credit or Debit
      category: data.category || 'General Operational',
      description: data.description || 'Financial transaction record',
      amount: parseFloat(data.amount) || 0,
      currency: data.currency || 'USD',
      method: data.method || 'Wire Transfer',
      status: 'Completed'
    };

    this.data.officeTransactions.unshift(newTxn);
    this.addAuditLog(
      'CREATE_TRANSACTION',
      'Financial Transaction',
      newTxn.id,
      `Logged ${newTxn.type} of $${newTxn.amount.toLocaleString()} (${newTxn.category}) - Ref: ${newTxn.reference}`
    );
    this.save();
    return JSON.parse(JSON.stringify(newTxn));
  }

  // Office Expenses
  getOfficeExpenses(officeId = null) {
    if (!this.data.officeExpenses) this.data.officeExpenses = [];
    let list = this.data.officeExpenses;
    if (officeId) {
      list = list.filter(e => e.officeId === officeId);
    }
    return JSON.parse(JSON.stringify(list));
  }

  createOfficeExpense(officeId, data) {
    if (!this.data.officeExpenses) this.data.officeExpenses = [];
    const office = this.getOfficeById(officeId);
    const tenantId = office ? office.tenantId : 'ten_sst';
    const id = 'exp_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4);

    const newExpense = {
      id,
      officeId,
      tenantId,
      fileProject: data.fileProject || 'General Operations',
      spentBy: data.spentBy || 'Office Staff',
      category: data.category || 'General Operational',
      description: data.description || 'Disbursement expense',
      date: data.date || new Date().toISOString().split('T')[0],
      amount: parseFloat(data.amount) || 0,
      currency: data.currency || 'USD',
      wallet: data.wallet || 'Operations Petty Cash'
    };

    this.data.officeExpenses.unshift(newExpense);

    // Also deduct or record in transactions ledger
    this.createOfficeTransaction(officeId, {
      type: 'Debit',
      amount: newExpense.amount,
      category: newExpense.category,
      method: 'Expense Voucher',
      description: `Expense: ${newExpense.description} (${newExpense.fileProject})`
    });

    this.addAuditLog(
      'LOG_EXPENSE',
      'Office Expense',
      newExpense.id,
      `Logged expense of $${newExpense.amount.toLocaleString()} by ${newExpense.spentBy} for ${newExpense.fileProject}`
    );
    this.save();
    return JSON.parse(JSON.stringify(newExpense));
  }

  deleteOfficeExpense(id) {
    if (!this.data.officeExpenses) this.data.officeExpenses = [];
    const idx = this.data.officeExpenses.findIndex(e => e.id === id);
    if (idx === -1) return false;
    const removed = this.data.officeExpenses.splice(idx, 1)[0];
    this.addAuditLog(
      'DELETE_EXPENSE',
      'Office Expense',
      id,
      `Deleted expense of $${removed.amount} (${removed.description})`
    );
    this.save();
    return true;
  }

  // Office Requisitions
  getOfficeRequisitions(officeId = null) {
    if (!this.data.officeRequisitions) this.data.officeRequisitions = [];
    let list = this.data.officeRequisitions;
    if (officeId) {
      list = list.filter(r => r.officeId === officeId);
    }
    return JSON.parse(JSON.stringify(list));
  }

  createOfficeRequisition(officeId, data) {
    if (!this.data.officeRequisitions) this.data.officeRequisitions = [];
    const office = this.getOfficeById(officeId);
    const tenantId = office ? office.tenantId : 'ten_sst';
    const id = 'req_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4);
    const count = this.data.officeRequisitions.length + 1;
    const requisitionNo = data.requisitionNo || `REQ-2026-${String(count).padStart(3, '0')}`;

    const newReq = {
      id,
      officeId,
      tenantId,
      requisitionNo,
      requestedBy: data.requestedBy || 'Office Staff',
      fileProject: data.fileProject || 'General Operations',
      category: data.category || 'General Operational',
      amount: parseFloat(data.amount) || 0,
      purpose: data.purpose || 'Operational fund requisition',
      date: data.date || new Date().toISOString().split('T')[0],
      status: 'Pending',
      wallet: data.wallet || 'Operations Petty Cash'
    };

    this.data.officeRequisitions.unshift(newReq);
    this.addAuditLog(
      'CREATE_REQUISITION',
      'Fund Requisition',
      newReq.id,
      `Created requisition "${newReq.requisitionNo}" for $${newReq.amount.toLocaleString()} by ${newReq.requestedBy}`
    );
    this.save();
    return JSON.parse(JSON.stringify(newReq));
  }

  disburseOfficeRequisition(id, disbursedAmount, walletName, remarks = '') {
    if (!this.data.officeRequisitions) this.data.officeRequisitions = [];
    const idx = this.data.officeRequisitions.findIndex(r => r.id === id);
    if (idx === -1) throw new Error(`Requisition ${id} not found.`);

    const req = this.data.officeRequisitions[idx];
    const finalAmount = parseFloat(disbursedAmount) || req.amount;
    const originalAmount = req.amount;
    const wallet = walletName || req.wallet || 'Operations Petty Cash';

    req.status = 'Disbursed';
    req.originalAmount = originalAmount;
    req.disbursedAmount = finalAmount;
    req.amount = finalAmount; // Overwritten amount
    req.wallet = wallet;
    req.disbursedAt = new Date().toISOString().split('T')[0];
    req.disbursementRemarks = remarks;

    // Deduct from wallet balance if wallet exists
    if (this.data.officeWallets) {
      const wlt = this.data.officeWallets.find(w => w.officeId === req.officeId && w.name === wallet);
      if (wlt) {
        wlt.balance = Math.max(0, (parseFloat(wlt.balance) || 0) - finalAmount);
        wlt.spentThisMonth = (parseFloat(wlt.spentThisMonth) || 0) + finalAmount;
      }
    }

    // Record Debit in officeTransactions
    this.createOfficeTransaction(req.officeId, {
      type: 'Debit',
      amount: finalAmount,
      category: req.category,
      method: 'Fund Disbursal',
      description: `Disbursed for ${req.requisitionNo} (${req.purpose}) [File: ${req.fileProject || 'N/A'}]`
    });

    const overrideNotice = (finalAmount !== originalAmount) ? ` (Overwritten from $${originalAmount.toLocaleString()} to $${finalAmount.toLocaleString()})` : '';
    this.addAuditLog(
      'DISBURSE_REQUISITION',
      'Fund Requisition',
      id,
      `Approved and disbursed $${finalAmount.toLocaleString()} for ${req.requisitionNo} via ${wallet}${overrideNotice}`
    );
    this.save();
    return JSON.parse(JSON.stringify(req));
  }

  rejectOfficeRequisition(id, reason = '') {
    if (!this.data.officeRequisitions) this.data.officeRequisitions = [];
    const idx = this.data.officeRequisitions.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.data.officeRequisitions[idx].status = 'Rejected';
    this.data.officeRequisitions[idx].rejectionReason = reason;
    this.addAuditLog(
      'REJECT_REQUISITION',
      'Fund Requisition',
      id,
      `Rejected requisition ${this.data.officeRequisitions[idx].requisitionNo}. Reason: ${reason || 'Administrative review'}`
    );
    this.save();
    return JSON.parse(JSON.stringify(this.data.officeRequisitions[idx]));
  }

  updateOfficeRequisitionStatus(id, status) {
    if (!this.data.officeRequisitions) this.data.officeRequisitions = [];
    const idx = this.data.officeRequisitions.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.data.officeRequisitions[idx].status = status;
    this.addAuditLog(
      'UPDATE_REQUISITION',
      'Fund Requisition',
      id,
      `Updated requisition "${this.data.officeRequisitions[idx].requisitionNo}" status to ${status}`
    );
    this.save();
    return JSON.parse(JSON.stringify(this.data.officeRequisitions[idx]));
  }

  // Office Wallets
  getOfficeWallets(officeId = null) {
    if (!this.data.officeWallets) this.data.officeWallets = [];
    let list = this.data.officeWallets;
    if (officeId) {
      list = list.filter(w => w.officeId === officeId);
    }
    return JSON.parse(JSON.stringify(list));
  }

  topUpOfficeWallet(id, amount) {
    if (!this.data.officeWallets) return null;
    const found = this.data.officeWallets.find(w => w.id === id);
    if (!found) return null;
    found.balance = (parseFloat(found.balance) || 0) + parseFloat(amount);
    this.addAuditLog(
      'TOPUP_WALLET',
      'Office Wallet',
      id,
      `Added $${amount} to wallet "${found.name}". New balance: $${found.balance}`
    );
    this.save();
    return JSON.parse(JSON.stringify(found));
  }
}

// Global instance
window.QrewStore = new DataStore();
