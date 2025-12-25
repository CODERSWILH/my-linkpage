<div class="modal fade" id="linkModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <form id="linkModalForm" class="modal-content">
      @csrf
      <div class="modal-header">
        <h5 class="modal-title">إدارة الرابط</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <input type="hidden" id="modal-id" name="id">
        <div class="mb-2"><input id="modal-title" name="title" class="form-control" placeholder="العنوان" required></div>
        <div class="mb-2"><input id="modal-url" name="url" class="form-control" placeholder="https://example.com" required></div>
        <div class="mb-2"><input id="modal-icon" name="icon" class="form-control" placeholder="رابط أيقونة (اختياري)"></div>
        <div class="form-check form-switch">
          <input id="modal-active" name="is_active" class="form-check-input" type="checkbox">
          <label class="form-check-label">مفعل</label>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">إلغاء</button>
        <button type="submit" class="btn btn-primary">حفظ</button>
      </div>
    </form>
  </div>
</div>
