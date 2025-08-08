import React, { useState, useEffect } from "react";
import {
  Box,
  useTheme,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Header from "components/Header";
import FlexBetween from "components/FlexBetween";
import {
  AddOutlined,
  EditOutlined,
  DeleteOutlined,
  CommentOutlined,
  Close,
  Send,
} from "@mui/icons-material";
import moment from "moment"; // For date formatting in comments and display

// Import your RTK Query hooks
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetUsersForAssignmentQuery, // For user dropdown
  useAddCommentToTaskMutation,
  useDeleteCommentFromTaskMutation,
} from "state/api";

const Tasks = () => {
  const theme = useTheme();

  // --- DataGrid State ---
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState({});
  const [search, setSearch] = useState("");

  // --- Filter States ---
  const [statusFilter, setStatusFilter] = useState("");
  const [assignedToFilter, setAssignedToFilter] = useState(""); // Holds user ID
  const [priorityFilter, setPriorityFilter] = useState("");
  const [dueDateStart, setDueDateStart] = useState(""); // Format: YYYY-MM-DD
  const [dueDateEnd, setDueDateEnd] = useState(""); // Format: YYYY-MM-DD

  // --- Dialog States ---
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null); // Null for add, object for edit

  // --- Comment Dialog State ---
  const [isCommentsDialogOpen, setIsCommentsDialogOpen] = useState(false);
  const [selectedTaskForComments, setSelectedTaskForComments] = useState(null);
  const [newCommentText, setNewCommentText] = useState("");
  // IMPORTANT: Replace with actual logged-in user ID
  // This needs to come from your authentication context (e.g., Redux store, useContext)
  const currentLoggedInUserId = "60e86b8b0e5d4a001c8c9a01"; // Placeholder: Replace with actual user ID
  const currentLoggedInUserName = "Suman Sharma"; // Placeholder: Replace with actual user name


  // --- RTK Query Hooks ---
  const { data, isLoading } = useGetTasksQuery({
    page,
    pageSize,
    sort: JSON.stringify(sort),
    search,
    statusFilter,
    assignedToFilter,
    priorityFilter,
    dueDateStart,
    dueDateEnd,
  });

  const { data: usersForAssignment, isLoading: isLoadingUsers } =
    useGetUsersForAssignmentQuery();

  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [addCommentToTask] = useAddCommentToTaskMutation();
  const [deleteCommentFromTask] = useDeleteCommentFromTaskMutation();

  // --- DataGrid Columns ---
  const columns = [
    {
      field: "title",
      headerName: "Title",
      flex: 1.5,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 2,
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      flex: 0.8,
      valueFormatter: (params) =>
        params.value ? moment(params.value).format("YYYY-MM-DD") : "",
    },
    {
      field: "assignedTo",
      headerName: "Assigned To",
      flex: 1,
      valueGetter: (params) => params.row.assignedTo?.name || "Unassigned", // Display user name
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.7,
      renderCell: (params) => {
        const status = params.value;
        let color = theme.palette.secondary[300];
        if (status === "Completed") {
          color = theme.palette.success.main;
        } else if (status === "In Progress") {
          color = theme.palette.warning.main;
        } else if (status === "Pending") {
          color = theme.palette.info.main;
        } else if (status === "Archived") {
          color = theme.palette.neutral.main;
        }
        return (
          <Typography sx={{ color: color, fontWeight: "bold" }}>
            {status}
          </Typography>
        );
      },
    },
    {
      field: "priority",
      headerName: "Priority",
      flex: 0.6,
      renderCell: (params) => {
        const priority = params.value;
        let color = theme.palette.secondary[300];
        if (priority === "High") {
          color = theme.palette.error.main;
        } else if (priority === "Medium") {
          color = theme.palette.warning.light;
        } else if (priority === "Low") {
          color = theme.palette.info.light;
        }
        return (
          <Typography sx={{ color: color, fontWeight: "bold" }}>
            {priority}
          </Typography>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <FlexBetween>
          <IconButton
            onClick={() => handleOpenComments(params.row)}
            sx={{ color: theme.palette.primary.main }}
            title="View Comments"
          >
            <CommentOutlined />
          </IconButton>
          <IconButton
            onClick={() => handleEditTask(params.row)}
            sx={{ color: theme.palette.secondary[300] }}
            title="Edit Task"
          >
            <EditOutlined />
          </IconButton>
          <IconButton
            onClick={() => handleDeleteTask(params.row._id)}
            sx={{ color: theme.palette.error.main }}
            title="Delete Task"
          >
            <DeleteOutlined />
          </IconButton>
        </FlexBetween>
      ),
    },
  ];

  // --- Task Form Handlers ---
  const handleAddTask = () => {
    setCurrentTask({
      title: "",
      description: "",
      dueDate: "",
      assignedTo: "", // Will be user ID
      status: "Pending",
      priority: "Medium",
    });
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task) => {
    // Format dueDate for input field if it exists
    const formattedTask = {
      ...task,
      dueDate: task.dueDate ? moment(task.dueDate).format("YYYY-MM-DD") : "",
      assignedTo: task.assignedTo?._id || "", // Ensure it's the ID for the select
    };
    setCurrentTask(formattedTask);
    setIsTaskFormOpen(true);
  };

  const handleSaveTask = async () => {
    try {
      if (currentTask._id) {
        // Update existing task
        await updateTask({ id: currentTask._id, ...currentTask }).unwrap();
      } else {
        // Create new task
        await createTask(currentTask).unwrap();
      }
      setIsTaskFormOpen(false);
      setCurrentTask(null); // Clear form data
    } catch (error) {
      console.error("Failed to save task:", error);
      // You might want to show an error message to the user
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(taskId).unwrap();
        // Optionally show a success message
      } catch (error) {
        console.error("Failed to delete task:", error);
        // Show error message
      }
    }
  };

  // --- Comment Handlers ---
  const handleOpenComments = (task) => {
    setSelectedTaskForComments(task);
    setIsCommentsDialogOpen(true);
  };

  const handleAddComment = async () => {
    if (!newCommentText.trim() || !selectedTaskForComments?._id || !currentLoggedInUserId) {
      alert("Comment cannot be empty or user not logged in.");
      return;
    }
    try {
      await addCommentToTask({
        id: selectedTaskForComments._id,
        userId: currentLoggedInUserId, // Pass the actual logged-in user's ID
        text: newCommentText,
      }).unwrap();
      setNewCommentText(""); // Clear comment input
      // RTK Query's `invalidatesTags: ["Tasks"]` will automatically refetch and update `data`
      // causing the `selectedTaskForComments` to update as well if you fetch by ID or manage state
      // For simplicity, we can refetch the individual task or update the local state if needed
      // (For now, invalidating "Tasks" is enough to update the grid which will then update the dialog too if opened again)
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await deleteCommentFromTask({
          taskId: selectedTaskForComments._id,
          commentId: commentId,
        }).unwrap();
        // Invalidate tasks tag to refresh, or manually update comments array in selectedTaskForComments
      } catch (error) {
        console.error("Failed to delete comment:", error);
      }
    }
  };

  // --- Render ---
  return (
    <Box m="1.5rem 2.5rem">
      <Header title="TASK MANAGEMENT" subtitle="Manage and assign tasks to users" />

      <Box mt="40px">
        {/* Filter and Action Section */}
        <FlexBetween mb="20px" flexWrap="wrap" gap="10px">
          {/* Search Input */}
          <TextField
            label="Search Tasks..."
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: "250px", flexGrow: 1 }}
          />

          {/* Status Filter */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Archived">Archived</MenuItem>
            </Select>
          </FormControl>

          {/* Priority Filter */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priorityFilter}
              label="Priority"
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </Select>
          </FormControl>

          {/* Assigned To Filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Assigned To</InputLabel>
            <Select
              value={assignedToFilter}
              label="Assigned To"
              onChange={(e) => setAssignedToFilter(e.target.value)}
              disabled={isLoadingUsers}
            >
              <MenuItem value="">All</MenuItem>
              {usersForAssignment?.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Due Date Range */}
          <TextField
            label="Due Date Start"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={dueDateStart}
            onChange={(e) => setDueDateStart(e.target.value)}
            sx={{ minWidth: 150 }}
          />
          <TextField
            label="Due Date End"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={dueDateEnd}
            onChange={(e) => setDueDateEnd(e.target.value)}
            sx={{ minWidth: 150 }}
          />

          {/* Add New Task Button */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddOutlined />}
            onClick={handleAddTask}
            sx={{
              backgroundColor: theme.palette.secondary[500],
              color: theme.palette.primary[600],
              fontWeight: "bold",
              padding: "10px 20px",
              "&:hover": {
                backgroundColor: theme.palette.secondary[600],
              },
            }}
          >
            Add New Task
          </Button>
        </FlexBetween>

        {/* DataGrid for displaying tasks */}
        <Box
          mt="20px"
          height="70vh" // Adjusted height for more content space
          sx={{
            "& .MuiDataGrid-root": {
              border: "none",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "none",
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: theme.palette.background.alt,
              color: theme.palette.secondary[100],
              borderBottom: "none",
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: theme.palette.primary.light,
            },
            "& .MuiDataGrid-footerContainer": {
              backgroundColor: theme.palette.background.alt,
              color: theme.palette.secondary[100],
              borderTop: "none",
            },
            "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
              color: `${theme.palette.secondary[200]} !important`,
            },
          }}
        >
          <DataGrid
            loading={isLoading || !data}
            getRowId={(row) => row._id}
            rows={(data && data.tasks) || []}
            columns={columns}
            rowCount={(data && data.total) || 0}
            rowsPerPageOptions={[20, 50, 100]}
            pagination
            page={page}
            pageSize={pageSize}
            paginationMode="server" // Set to server mode
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
            onSortModelChange={(newSortModel) => setSort(...newSortModel)}
            // You might want to add a custom toolbar if needed
            // components={{ Toolbar: GridToolbar }}
          />
        </Box>
      </Box>

      {/* Add/Edit Task Dialog */}
      <Dialog open={isTaskFormOpen} onClose={() => setIsTaskFormOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{currentTask?._id ? "Edit Task" : "Add New Task"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            type="text"
            fullWidth
            variant="outlined"
            value={currentTask?.title || ""}
            onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={currentTask?.description || ""}
            onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Assigned To</InputLabel>
            <Select
              value={currentTask?.assignedTo || ""}
              label="Assigned To"
              onChange={(e) => setCurrentTask({ ...currentTask, assignedTo: e.target.value })}
              disabled={isLoadingUsers}
            >
              <MenuItem value="">None</MenuItem>
              {usersForAssignment?.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Due Date"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={currentTask?.dueDate || ""}
            onChange={(e) => setCurrentTask({ ...currentTask, dueDate: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={currentTask?.status || "Pending"}
              label="Status"
              onChange={(e) => setCurrentTask({ ...currentTask, status: e.target.value })}
            >
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Archived">Archived</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={currentTask?.priority || "Medium"}
              label="Priority"
              onChange={(e) => setCurrentTask({ ...currentTask, priority: e.target.value })}
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsTaskFormOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveTask} variant="contained" color="primary">
            {currentTask?._id ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Comments Dialog */}
      <Dialog
        open={isCommentsDialogOpen}
        onClose={() => setIsCommentsDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Comments for: {selectedTaskForComments?.title}
          <IconButton
            aria-label="close"
            onClick={() => setIsCommentsDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ minHeight: "300px", maxHeight: "500px", overflowY: "auto" }}>
          {selectedTaskForComments?.comments?.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              No comments yet.
            </Typography>
          ) : (
            <List>
              {selectedTaskForComments?.comments?.map((comment) => (
                <React.Fragment key={comment._id}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={
                        <FlexBetween>
                          <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="subtitle2"
                            color="text.primary"
                          >
                            {comment.user?.name || `User ID: ${comment.user}`}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {moment(comment.createdAt).format("MMM D, YYYY h:mm A")}
                          </Typography>
                          {comment.user?._id === currentLoggedInUserId && ( // Only allow deletion for owned comments
                            <IconButton
                                edge="end"
                                aria-label="delete"
                                size="small"
                                onClick={() => handleDeleteComment(comment._id)}
                            >
                                <DeleteOutlined fontSize="small" />
                            </IconButton>
                          )}
                        </FlexBetween>
                      }
                      secondary={
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          sx={{ display: 'block', mt: 0.5 }}
                        >
                          {comment.text}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, display: "block" }}>
          <Box display="flex" alignItems="center">
            <TextField
              label="Add a comment..."
              variant="outlined"
              fullWidth
              multiline
              rows={1}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              sx={{ mr: 1 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddComment}
              endIcon={<Send />}
              disabled={!newCommentText.trim()}
            >
              Send
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tasks;