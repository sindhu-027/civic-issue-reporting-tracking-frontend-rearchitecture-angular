import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../shared/api.service';

@Component({
  selector: 'app-view-complaints',
  standalone: false,
  templateUrl: './view-complaints.component.html',
  styleUrls: ['./view-complaints.component.css']
})
export class ViewComplaintsComponent implements OnInit {

  complaints: any[] = [];
  selectedComplaint: any = null;

  loading = true;
  error = '';
  comment = '';
  voting = false;
  postingComment = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadComplaints();
  }

  async loadComplaints() {
    try {
      this.loading = true;
      const res: any = await this.api.get('/complaints/all').toPromise();
      this.complaints = res || [];
    } catch (err) {
      this.error = '⚠️ Failed to load complaints. Please try again later.';
    } finally {
      this.loading = false;
    }
  }

  async fetchComplaintById(id: string) {
    try {
      const res: any = await this.api.get('/complaints/all').toPromise();
      return res?.find((c: any) => c._id === id) || null;
    } catch {
      return null;
    }
  }

  statusClass(status: string) {
    if (status === 'Resolved') return 'text-green-600';
    if (status === 'In Progress') return 'text-yellow-600';
    if (status === 'Assigned') return 'text-indigo-600';
    return 'text-gray-700';
  }

  async handleVote(id: string, type: 'up' | 'down') {
    try {
      this.voting = true;
      const endpoint = type === 'up' ? 'upvote' : 'downvote';
      await this.api.post(`/complaints/${id}/${endpoint}`, {}).toPromise();
      await this.loadComplaints();

      if (this.selectedComplaint?._id === id) {
        this.selectedComplaint = await this.fetchComplaintById(id);
      }
    } finally {
      this.voting = false;
    }
  }

  async handleComment() {
    if (!this.selectedComplaint || !this.comment.trim()) return;

    try {
      this.postingComment = true;
      await this.api.post(
        `/complaints/${this.selectedComplaint._id}/comment`,
        { text: this.comment.trim() }
      ).toPromise();

      await this.loadComplaints();
      this.selectedComplaint = await this.fetchComplaintById(this.selectedComplaint._id);
      this.comment = '';
    } finally {
      this.postingComment = false;
    }
  }

  go(url: string) {
    window.location.href = url;
  }
}
