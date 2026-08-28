document.addEventListener('DOMContentLoaded', () => {
  const signUpButtons = document.querySelectorAll('.signup-btn');

  signUpButtons.forEach((button) => {
    const targetPage = button.dataset.page;

    const redirect = () => {
      if (targetPage) {
        window.location.href = targetPage;
      }
    };

    button.addEventListener('click', redirect);

    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        redirect();
      }
    });
  });

  if (document.body.dataset.page !== 'authority') {
    return;
  }

  const supervisorCountInput = document.getElementById('supervisorCount');
  const supervisorForms = document.getElementById('supervisorForms');
  const equipmentForms = document.getElementById('equipmentForms');
  const addEquipmentBtn = document.getElementById('addEquipmentBtn');
  const authorityForm = document.getElementById('authority-form');
  const summaryCard = document.getElementById('reportSummary');
  const summaryContent = document.getElementById('summaryContent');

  const createSupervisorForm = (index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'supervisor-entry';
    wrapper.innerHTML = `
      <h3>Supervisor ${index}</h3>
      <div class="supervisor-row">
        <label>
          Name
          <input type="text" name="supervisorName${index}" placeholder="Supervisor name" required />
        </label>

        <label>
          Email
          <input type="email" name="supervisorEmail${index}" placeholder="Supervisor email" required />
        </label>

        <label>
          Which mines he supervises
          <input type="text" name="supervisorMines${index}" placeholder="Mine names" required />
        </label>

        <label>
          Work time slot
          <select name="supervisorSlot${index}">
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Evening">Evening</option>
            <option value="Night">Night</option>
          </select>
        </label>
      </div>
    `;
    return wrapper;
  };

  const createEquipmentForm = () => {
    const wrapper = document.createElement('div');
    wrapper.className = 'equipment-entry';
    wrapper.innerHTML = `
      <h3>Machinery</h3>
      <div class="equipment-row">
        <label>
          Name of machinery
          <input type="text" name="machineryName" placeholder="Equipment name" required />
        </label>

        <label>
          License issue
          <select name="licenseIssue">
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </label>

        <label>
          Latest maintenance date
          <input type="date" name="maintenanceDate" required />
        </label>

        <label>
          Repair status
          <select name="repairStatus">
            <option value="Good">Good</option>
            <option value="Delayed">Delayed</option>
            <option value="Requires Attention">Requires Attention</option>
          </select>
        </label>
      </div>
    `;
    return wrapper;
  };

  const renderSupervisorForms = () => {
    const count = Number(supervisorCountInput.value) || 0;
    supervisorForms.innerHTML = '';

    for (let index = 1; index <= count; index += 1) {
      supervisorForms.appendChild(createSupervisorForm(index));
    }
  };

  const renderEquipmentForms = () => {
    equipmentForms.innerHTML = '';
    equipmentForms.appendChild(createEquipmentForm());
  };

  supervisorCountInput.addEventListener('input', renderSupervisorForms);
  addEquipmentBtn.addEventListener('click', () => {
    equipmentForms.appendChild(createEquipmentForm());
  });

  renderSupervisorForms();
  renderEquipmentForms();

  const getMaintenanceDelay = (dateValue) => {
    if (!dateValue) {
      return false;
    }

    const currentDate = new Date();
    const maintenanceDate = new Date(dateValue);
    const differenceInDays = (currentDate - maintenanceDate) / (1000 * 60 * 60 * 24);
    return differenceInDays > 180;
  };

  authorityForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = {
      company: {
        companyName: authorityForm.elements.companyName.value.trim(),
        establishmentDate: authorityForm.elements.establishmentDate.value,
        applicantName: authorityForm.elements.applicantName.value.trim(),
        applicantAddress: authorityForm.elements.applicantAddress.value.trim(),
        headquartersState: authorityForm.elements.headquartersState.value.trim(),
        headquartersCity: authorityForm.elements.headquartersCity.value.trim(),
        mineName: authorityForm.elements.mineName.value.trim(),
        miningAddress: authorityForm.elements.miningAddress.value.trim(),
      },
      supervisors: Array.from(document.querySelectorAll('.supervisor-entry')).map((entry, index) => ({
        name: entry.querySelector(`input[name="supervisorName${index + 1}"]`)?.value.trim() || '',
        email: entry.querySelector(`input[name="supervisorEmail${index + 1}"]`)?.value.trim() || '',
        supervisedMines: entry.querySelector(`input[name="supervisorMines${index + 1}"]`)?.value.trim() || '',
        timeSlot: entry.querySelector(`select[name="supervisorSlot${index + 1}"]`)?.value || 'Morning',
      })),
      equipment: Array.from(document.querySelectorAll('.equipment-entry')).map((entry) => ({
        name: entry.querySelector('input[name="machineryName"]')?.value.trim() || '',
        licenseIssue: entry.querySelector('select[name="licenseIssue"]')?.value || 'No',
        latestMaintenance: entry.querySelector('input[name="maintenanceDate"]')?.value || '',
        repairStatus: entry.querySelector('select[name="repairStatus"]')?.value || 'Good',
      })),
      mineIssues: {
        total: 0,
        reportedBy: 'None',
        details: []
      }
    };

    const equipmentIssues = formData.equipment.filter((item) => {
      return item.licenseIssue === 'Yes' || item.repairStatus === 'Requires Attention' || item.repairStatus === 'Delayed';
    }).map((item) => item.name || 'Unnamed equipment');

    const delayedMaintenance = formData.equipment.filter((item) => {
      return getMaintenanceDelay(item.latestMaintenance) || item.repairStatus === 'Delayed';
    }).map((item) => item.name || 'Unnamed equipment');

    const supervisorTimeSlots = formData.supervisors.map((supervisor) => {
      return `${supervisor.name || 'Supervisor'} - ${supervisor.timeSlot}`;
    });

    const summaryHTML = `
      <ul class="summary-list">
        <li><strong>Company:</strong> ${formData.company.companyName}</li>
        <li><strong>Applicant:</strong> ${formData.company.applicantName}</li>
        <li><strong>Headquarters:</strong> ${formData.company.headquartersCity}, ${formData.company.headquartersState}</li>
        <li><strong>Mine:</strong> ${formData.company.mineName}</li>
        <li><strong>Electronic equipment with issues:</strong> ${equipmentIssues.length ? equipmentIssues.join(', ') : 'None'}</li>
        <li><strong>Equipment with delayed maintenance:</strong> ${delayedMaintenance.length ? delayedMaintenance.join(', ') : 'None'}</li>
        <li><strong>Supervisor time-slot assignment:</strong> ${supervisorTimeSlots.length ? supervisorTimeSlots.join('; ') : 'No supervisors assigned'}</li>
        <li><strong>Mine problems/issues:</strong> ${formData.mineIssues.total}</li>
        <li><strong>Reported by:</strong> ${formData.mineIssues.reportedBy}</li>
      </ul>
    `;

    summaryContent.innerHTML = summaryHTML;
    summaryCard.classList.remove('hidden');
    summaryCard.classList.add('visible');
    summaryCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

    window.appData = formData;
    localStorage.setItem('authorityData', JSON.stringify(formData));

    setTimeout(() => {
      window.location.href = 'authority-use.html';
    }, 2000);
  });

  if (document.body.dataset.page !== 'supervisor') {
    if (document.body.dataset.page !== 'authority-use') {
      return;
    }
  }

  const mineCountInput = document.getElementById('mineCount');
  const mineForms = document.getElementById('mineForms');
  const issuesForms = document.getElementById('issuesForms');
  const equipmentStatusForms = document.getElementById('equipmentStatusForms');
  const addIssueBtn = document.getElementById('addIssueBtn');
  const addEquipmentStatusBtn = document.getElementById('addEquipmentStatusBtn');
  const supervisorForm = document.getElementById('supervisor-form');
  const supervisorSummaryCard = document.getElementById('reportSummary');
  const supervisorSummaryContent = document.getElementById('summaryContent');

  const createMineForm = (index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'mine-entry';
    wrapper.innerHTML = `
      <h3>Mine ${index}</h3>
      <div class="mine-row">
        <label>
          Mine name
          <input type="text" name="mineName${index}" placeholder="Mine name" required />
        </label>

        <label>
          Location
          <input type="text" name="mineLocation${index}" placeholder="Location" required />
        </label>

        <label>
          Total workers
          <input type="number" name="mineTotalWorkers${index}" min="0" placeholder="Number of workers" required />
        </label>

        <label>
          Status
          <select name="mineStatus${index}">
            <option value="Active">Active</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Idle">Idle</option>
          </select>
        </label>
      </div>
    `;
    return wrapper;
  };

  const createIssueForm = () => {
    const wrapper = document.createElement('div');
    wrapper.className = 'issue-entry';
    wrapper.innerHTML = `
      <h3>Issue Report</h3>
      <div class="issue-row">
        <label>
          Issue description
          <textarea name="issueDescription" rows="3" placeholder="Describe the issue" required></textarea>
        </label>

        <label>
          Severity level
          <select name="issueSeverity">
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </label>

        <label>
          Date reported
          <input type="date" name="issueDate" required />
        </label>

        <label>
          Affected mine
          <input type="text" name="issueMine" placeholder="Which mine" required />
        </label>
      </div>
    `;
    return wrapper;
  };

  const createEquipmentStatusForm = () => {
    const wrapper = document.createElement('div');
    wrapper.className = 'equipment-status-entry';
    wrapper.innerHTML = `
      <h3>Equipment Status</h3>
      <div class="equipment-status-row">
        <label>
          Equipment name
          <input type="text" name="equipmentName" placeholder="Equipment name" required />
        </label>

        <label>
          Current condition
          <select name="equipmentCondition">
            <option value="Working">Working</option>
            <option value="Needs Repair">Needs Repair</option>
            <option value="Out of Service">Out of Service</option>
          </select>
        </label>

        <label>
          Last inspection date
          <input type="date" name="inspectionDate" required />
        </label>

        <label>
          Next maintenance date
          <input type="date" name="nextMaintenanceDate" required />
        </label>
      </div>
    `;
    return wrapper;
  };

  const renderMineForms = () => {
    const count = Number(mineCountInput.value) || 1;
    mineForms.innerHTML = '';

    for (let index = 1; index <= count; index += 1) {
      mineForms.appendChild(createMineForm(index));
    }
  };

  mineCountInput.addEventListener('input', renderMineForms);
  addIssueBtn.addEventListener('click', () => {
    issuesForms.appendChild(createIssueForm());
  });
  addEquipmentStatusBtn.addEventListener('click', () => {
    equipmentStatusForms.appendChild(createEquipmentStatusForm());
  });

  renderMineForms();
  issuesForms.appendChild(createIssueForm());
  equipmentStatusForms.appendChild(createEquipmentStatusForm());

  supervisorForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const supervisorData = {
      personal: {
        name: supervisorForm.elements.supervisorName.value.trim(),
        email: supervisorForm.elements.supervisorEmail.value.trim(),
        phone: supervisorForm.elements.supervisorPhone.value.trim() || 'Not provided',
        address: supervisorForm.elements.supervisorAddress.value.trim(),
      },
      mines: Array.from(document.querySelectorAll('.mine-entry')).map((entry, index) => ({
        name: entry.querySelector(`input[name="mineName${index + 1}"]`)?.value.trim() || '',
        location: entry.querySelector(`input[name="mineLocation${index + 1}"]`)?.value.trim() || '',
        totalWorkers: entry.querySelector(`input[name="mineTotalWorkers${index + 1}"]`)?.value || '0',
        status: entry.querySelector(`select[name="mineStatus${index + 1}"]`)?.value || 'Active',
      })),
      issues: Array.from(document.querySelectorAll('.issue-entry')).map((entry) => ({
        description: entry.querySelector('textarea[name="issueDescription"]')?.value.trim() || '',
        severity: entry.querySelector('select[name="issueSeverity"]')?.value || 'Low',
        date: entry.querySelector('input[name="issueDate"]')?.value || '',
        mineName: entry.querySelector('input[name="issueMine"]')?.value.trim() || '',
      })),
      equipmentStatus: Array.from(document.querySelectorAll('.equipment-status-entry')).map((entry) => ({
        name: entry.querySelector('input[name="equipmentName"]')?.value.trim() || '',
        condition: entry.querySelector('select[name="equipmentCondition"]')?.value || 'Working',
        lastInspection: entry.querySelector('input[name="inspectionDate"]')?.value || '',
        nextMaintenance: entry.querySelector('input[name="nextMaintenanceDate"]')?.value || '',
      })),
    };

    const criticalIssues = supervisorData.issues.filter(
      (issue) => issue.severity === 'Critical' || issue.severity === 'High'
    );

    const equipmentNeedingRepair = supervisorData.equipmentStatus.filter(
      (eq) => eq.condition !== 'Working'
    );

    const totalMinesAssigned = supervisorData.mines.length;

    const summaryHTML = `
      <ul class="summary-list">
        <li><strong>Supervisor:</strong> ${supervisorData.personal.name}</li>
        <li><strong>Email:</strong> ${supervisorData.personal.email}</li>
        <li><strong>Phone:</strong> ${supervisorData.personal.phone}</li>
        <li><strong>Address:</strong> ${supervisorData.personal.address}</li>
        <li><strong>Total mines assigned:</strong> ${totalMinesAssigned}</li>
        <li><strong>Assigned mines:</strong> ${supervisorData.mines.map((m) => m.name).join(', ') || 'None'}</li>
        <li><strong>Total issues reported:</strong> ${supervisorData.issues.length}</li>
        <li><strong>Critical/High severity issues:</strong> ${criticalIssues.length > 0 ? criticalIssues.map((i) => `${i.description} (${i.severity})`).join('; ') : 'None'}</li>
        <li><strong>Equipment needing repair:</strong> ${equipmentNeedingRepair.length > 0 ? equipmentNeedingRepair.map((e) => e.name).join(', ') : 'None'}</li>
        <li><strong>Total equipment reports:</strong> ${supervisorData.equipmentStatus.length}</li>
      </ul>
    `;

    supervisorSummaryContent.innerHTML = summaryHTML;
    supervisorSummaryCard.classList.remove('hidden');
    supervisorSummaryCard.classList.add('visible');
    supervisorSummaryCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

    window.supervisorData = supervisorData;
    localStorage.setItem('supervisorData', JSON.stringify(supervisorData));

    setTimeout(() => {
      window.location.href = 'supervisor-use.html';
    }, 2000);
  });

  if (document.body.dataset.page !== 'authority-use') {
    if (document.body.dataset.page !== 'supervisor-use') {
      return;
    }
  }

  const authorityData = JSON.parse(localStorage.getItem('authorityData') || '{}');
  let repairTasks = JSON.parse(localStorage.getItem('repairTasks') || '[]');

  document.getElementById('companyNameDisplay').textContent = `Company: ${authorityData.company?.companyName || 'N/A'}`;
  document.getElementById('mineNameDisplay').textContent = `Mine: ${authorityData.company?.mineName || 'N/A'} | Address: ${authorityData.company?.miningAddress || 'N/A'}`;

  const equipmentWithIssues = authorityData.equipment?.filter((eq) => {
    return eq.licenseIssue === 'Yes' || eq.repairStatus === 'Requires Attention';
  }) || [];

  const maintenanceDelays = authorityData.equipment?.filter((eq) => {
    const maintDate = new Date(eq.latestMaintenance);
    const currentDate = new Date();
    const diffDays = (currentDate - maintDate) / (1000 * 60 * 60 * 24);
    return diffDays > 180 || eq.repairStatus === 'Delayed';
  }) || [];

  const populateIssues = (containerId, issues, type) => {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (issues.length === 0) {
      container.innerHTML = '<p class="no-data">No issues reported</p>';
      return;
    }

    issues.forEach((issue) => {
      const issueEl = document.createElement('div');
      issueEl.className = `issue-item warning`;
      issueEl.innerHTML = `<strong>${issue.name || 'Equipment'}</strong><small>${issue.repairStatus || issue.licenseIssue || 'Issue'}</small>`;
      container.appendChild(issueEl);
    });
  };

  populateIssues('equipmentIssuesContainer', equipmentWithIssues, 'equipment');
  populateIssues('maintenanceProblemsContainer', maintenanceDelays, 'maintenance');

  const repairForm = document.getElementById('repair-form');
  const supervisorSelect = repairForm?.elements.assignedSupervisor;

  if (supervisorSelect) {
    authorityData.supervisors?.forEach((supervisor) => {
      const option = document.createElement('option');
      option.value = supervisor.name;
      option.textContent = supervisor.name;
      supervisorSelect.appendChild(option);
    });
  }

  repairForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    const repairData = {
      equipment: repairForm.elements.equipmentName.value.trim(),
      type: repairForm.elements.repairType.value,
      description: repairForm.elements.description.value.trim(),
      priority: repairForm.elements.priority.value,
      assignedSupervisor: repairForm.elements.assignedSupervisor.value,
      completionDate: repairForm.elements.completionDate.value,
      dateAdded: new Date().toISOString(),
    };

    repairTasks.push(repairData);
    localStorage.setItem('repairTasks', JSON.stringify(repairTasks));

    if (repairData.type === 'Field Repair') {
      const fieldRepairsContainer = document.getElementById('fieldRepairsContainer');
      const noDataMsg = fieldRepairsContainer.querySelector('.no-data');
      if (noDataMsg) {
        noDataMsg.remove();
      }

      const repairEl = document.createElement('div');
      repairEl.className = 'issue-item info';
      repairEl.innerHTML = `
        <strong>${repairData.equipment}</strong>
        <small>${repairData.description}</small>
        <p>Priority: ${repairData.priority} | Assigned to: ${repairData.assignedSupervisor}</p>
      `;
      fieldRepairsContainer.appendChild(repairEl);
    } else {
      const repairWorksContainer = document.getElementById('repairWorksContainer');
      const noDataMsg = repairWorksContainer.querySelector('.no-data');
      if (noDataMsg) {
        noDataMsg.remove();
      }

      const repairEl = document.createElement('div');
      repairEl.className = 'issue-item success';
      repairEl.innerHTML = `
        <strong>${repairData.equipment}</strong>
        <small>${repairData.description}</small>
        <p>Priority: ${repairData.priority} | Due: ${repairData.completionDate}</p>
      `;
      repairWorksContainer.appendChild(repairEl);
    }

    repairForm.reset();
  });

  const populateRepairTasks = () => {
    const fieldRepairsContainer = document.getElementById('fieldRepairsContainer');
    const repairWorksContainer = document.getElementById('repairWorksContainer');

    const fieldRepairs = repairTasks.filter((task) => task.type === 'Field Repair');
    const repairWorks = repairTasks.filter((task) => task.type === 'Repair Work');

    if (fieldRepairs.length > 0) {
      fieldRepairsContainer.innerHTML = '';
      fieldRepairs.forEach((repair) => {
        const el = document.createElement('div');
        el.className = 'issue-item info';
        el.innerHTML = `
          <strong>${repair.equipment}</strong>
          <small>${repair.description}</small>
          <p>Priority: ${repair.priority} | Assigned to: ${repair.assignedSupervisor}</p>
        `;
        fieldRepairsContainer.appendChild(el);
      });
    }

    if (repairWorks.length > 0) {
      repairWorksContainer.innerHTML = '';
      repairWorks.forEach((repair) => {
        const el = document.createElement('div');
        el.className = 'issue-item success';
        el.innerHTML = `
          <strong>${repair.equipment}</strong>
          <small>${repair.description}</small>
          <p>Priority: ${repair.priority} | Due: ${repair.completionDate}</p>
        `;
        repairWorksContainer.appendChild(el);
      });
    }
  };

  populateRepairTasks();

  const exportDataBtn = document.getElementById('exportDataBtn');
  exportDataBtn?.addEventListener('click', () => {
    const reportData = {
      company: authorityData.company,
      supervisors: authorityData.supervisors,
      equipmentWithIssues,
      maintenanceDelays,
      repairTasks,
    };

    const report = JSON.stringify(reportData, null, 2);
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'authority-report.json';
    link.click();
    URL.revokeObjectURL(url);
  });

  const backBtn = document.getElementById('backBtn');
  backBtn?.addEventListener('click', () => {
    window.location.href = 'profile.html';
  });

  if (document.body.dataset.page !== 'supervisor-use') {
    return;
  }

  const supervisorData = JSON.parse(localStorage.getItem('supervisorData') || '{}');
  repairTasks = JSON.parse(localStorage.getItem('repairTasks') || '[]');
  const supervisorChecklist = JSON.parse(localStorage.getItem('supervisorChecklist') || '{}');
  const fieldObservations = JSON.parse(localStorage.getItem('fieldObservations') || '[]');

  document.getElementById('supervisorNameDisplay').textContent = `Supervisor: ${supervisorData.personal?.name || 'N/A'}`;
  document.getElementById('assignedMinesDisplay').textContent = `Email: ${supervisorData.personal?.email || 'N/A'} | Assigned Mines: ${supervisorData.mines?.map((m) => m.name).join(', ') || 'N/A'}`;

  const populateMineDropdown = () => {
    const mineSelect = document.getElementById('mineNameSelect');
    supervisorData.mines?.forEach((mine) => {
      const option = document.createElement('option');
      option.value = mine.name;
      option.textContent = mine.name;
      mineSelect.appendChild(option);
    });
  };

  populateMineDropdown();

  const populateIssuesAndRepairs = () => {
    const issuesContainer = document.getElementById('issuesContainer');
    const fieldRepairsContainer = document.getElementById('fieldRepairsContainer');
    const repairWorksContainer = document.getElementById('repairWorksContainer');

    if (supervisorData.issues && supervisorData.issues.length > 0) {
      issuesContainer.innerHTML = '';
      supervisorData.issues.forEach((issue) => {
        const issueEl = document.createElement('div');
        let className = 'issue-item';
        if (issue.severity === 'Critical' || issue.severity === 'High') {
          className += ' warning';
        } else if (issue.severity === 'Medium') {
          className += ' info';
        }
        issueEl.className = className;
        issueEl.innerHTML = `
          <strong>${issue.description}</strong>
          <small>Mine: ${issue.mineName} | Severity: ${issue.severity}</small>
          <p>Date: ${issue.date}</p>
        `;
        issuesContainer.appendChild(issueEl);
      });
    }

    if (supervisorData.equipmentStatus && supervisorData.equipmentStatus.length > 0) {
      const equipmentContainer = document.getElementById('equipmentStatusContainer');
      equipmentContainer.innerHTML = '';
      supervisorData.equipmentStatus.forEach((equipment) => {
        const eqEl = document.createElement('div');
        const className = equipment.condition !== 'Working' ? 'issue-item warning' : 'issue-item success';
        eqEl.className = className;
        eqEl.innerHTML = `
          <strong>${equipment.name}</strong>
          <small>Condition: ${equipment.condition}</small>
          <p>Last Inspection: ${equipment.lastInspection} | Next Maintenance: ${equipment.nextMaintenance}</p>
        `;
        equipmentContainer.appendChild(eqEl);
      });
    }

    const fieldRepairs = repairTasks.filter((task) => task.type === 'Field Repair' && task.assignedSupervisor === supervisorData.personal?.name);
    const repairWorks = repairTasks.filter((task) => task.type === 'Repair Work' && task.assignedSupervisor === supervisorData.personal?.name);

    if (fieldRepairs.length > 0) {
      fieldRepairsContainer.innerHTML = '';
      fieldRepairs.forEach((repair) => {
        const repairEl = document.createElement('div');
        repairEl.className = 'issue-item info';
        repairEl.innerHTML = `
          <strong>${repair.equipment}</strong>
          <small>${repair.description}</small>
          <p>Priority: ${repair.priority}</p>
        `;
        fieldRepairsContainer.appendChild(repairEl);
      });
    }

    if (repairWorks.length > 0) {
      repairWorksContainer.innerHTML = '';
      repairWorks.forEach((repair) => {
        const repairEl = document.createElement('div');
        repairEl.className = 'issue-item success';
        repairEl.innerHTML = `
          <strong>${repair.equipment}</strong>
          <small>${repair.description}</small>
          <p>Priority: ${repair.priority} | Due: ${repair.completionDate}</p>
        `;
        repairWorksContainer.appendChild(repairEl);
      });
    }
  };

  populateIssuesAndRepairs();

  const complianceCheckboxes = document.querySelectorAll('.compliance-check');
  const updateChecklistProgress = () => {
    const totalChecks = complianceCheckboxes.length;
    const checkedCount = Array.from(complianceCheckboxes).filter((cb) => cb.checked).length;
    const percentage = totalChecks > 0 ? Math.round((checkedCount / totalChecks) * 100) : 0;

    document.getElementById('checklistProgress').textContent = percentage;
    const progressFill = document.getElementById('progressFill');
    progressFill.style.width = `${percentage}%`;

    const pendingWarning = document.getElementById('pendingWarning');
    if (percentage < 100) {
      pendingWarning.classList.remove('hidden');
    } else {
      pendingWarning.classList.add('hidden');
    }

    supervisorChecklist.completionPercentage = percentage;
    supervisorChecklist.checkedItems = Array.from(complianceCheckboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.name);
    localStorage.setItem('supervisorChecklist', JSON.stringify(supervisorChecklist));
  };

  complianceCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', updateChecklistProgress);
    if (supervisorChecklist.checkedItems?.includes(checkbox.name)) {
      checkbox.checked = true;
    }
  });

  updateChecklistProgress();

  const fieldObservationForm = document.getElementById('field-observation-form');
  fieldObservationForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    const observation = {
      mineName: fieldObservationForm.elements.mineName.value,
      type: fieldObservationForm.elements.observationType.value,
      description: fieldObservationForm.elements.description.value.trim(),
      severity: fieldObservationForm.elements.severity.value,
      date: fieldObservationForm.elements.observationDate.value,
      supervisorName: supervisorData.personal?.name || 'Unknown',
      submittedAt: new Date().toISOString(),
    };

    fieldObservations.push(observation);
    localStorage.setItem('fieldObservations', JSON.stringify(fieldObservations));

    const issuesContainer = document.getElementById('issuesContainer');
    const noDataMsg = issuesContainer.querySelector('.no-data');
    if (noDataMsg) {
      noDataMsg.remove();
    }

    const obsEl = document.createElement('div');
    const className = observation.severity === 'Critical' || observation.severity === 'High' ? 'issue-item warning' : 'issue-item info';
    obsEl.className = className;
    obsEl.innerHTML = `
      <strong>${observation.description}</strong>
      <small>Mine: ${observation.mineName} | Type: ${observation.type}</small>
      <p>Severity: ${observation.severity} | Date: ${observation.date}</p>
    `;
    issuesContainer.appendChild(obsEl);

    fieldObservationForm.reset();
  });

  const submitChecklistBtn = document.getElementById('submitChecklistBtn');
  submitChecklistBtn?.addEventListener('click', () => {
    const percentage = parseInt(document.getElementById('checklistProgress').textContent);

    if (percentage < 100) {
      const authorityData = JSON.parse(localStorage.getItem('authorityData') || '{}');
      const notifications = JSON.parse(localStorage.getItem('authorityNotifications') || '[]');

      const notification = {
        type: 'Pending Checklist',
        message: `Supervisor ${supervisorData.personal?.name} has pending checklist items (${percentage}% complete)`,
        supervisorName: supervisorData.personal?.name,
        checklistPercentage: percentage,
        timestamp: new Date().toISOString(),
      };

      notifications.push(notification);
      localStorage.setItem('authorityNotifications', JSON.stringify(notifications));

      alert(`✓ Checklist submitted (${percentage}% complete). Authorities have been notified of pending items.`);
    } else {
      alert('✓ All checklist items completed! Submitted successfully.');
    }

    supervisorChecklist.lastSubmitted = new Date().toISOString();
    localStorage.setItem('supervisorChecklist', JSON.stringify(supervisorChecklist));
  });

  const backButtonId = document.getElementById('backBtn');
  backButtonId?.addEventListener('click', () => {
    window.location.href = 'profile.html';
  });
});
