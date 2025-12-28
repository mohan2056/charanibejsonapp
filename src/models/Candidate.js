export class Candidate {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.email = data.email || '';
    this.phone = data.phone || '';
    this.college = data.college || '';
    this.branch = data.branch || '';
    this.gender = data.gender || '';
    this.backlogs = data.backlogs || 0;
    // resumeData is stored separately, resumeName is stored in JSON
    this.resumeName = data.resumeName || null;
  }
}
