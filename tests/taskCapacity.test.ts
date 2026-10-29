import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getActiveTasksForUser, getProjectedActiveTaskCount, getWorkloadInfo } from '../src/utils/taskUtils';
import type { Task } from '../src/types';

const task = (id: string, status: Task['status'] = 'todo', assigneeId = 'amir'): Task => ({
  id, status, assigneeId, assigneeIds: [assigneeId], code: id, projectId: 'simulation',
  title: 'Technical simulation', description: '', priority: 'Medium',
  startDate: '2026-07-06', deadline: '2026-07-13', subtasks: [],
});
const count = (tasks: Task[], user = 'amir') => getActiveTasksForUser(tasks, user).length;

test('actual workload: zero, active statuses, done and canceled/on-hold', () => {
  assert.equal(count([]), 0);
  for (const status of ['todo', 'in_progress', 'review', 'done', 'canceled_on_hold'] as const) {
    assert.equal(count([task('one', status)]), ['done', 'canceled_on_hold'].includes(status) ? 0 : 1);
  }
});

test('create, unchanged edit, save and reload count each task once', () => {
  const first = task('one');
  assert.equal(getProjectedActiveTaskCount([], 'amir', first), 1);
  const saved = [first];
  assert.equal(count(saved), 1);
  assert.equal(getProjectedActiveTaskCount(saved, 'amir', {...first, title: 'edited'} as Task), 1);
  assert.equal(count(JSON.parse(JSON.stringify(saved))), 1);
  assert.equal(getProjectedActiveTaskCount(saved, 'amir', task('two')), 2);
  assert.equal(count([...saved, task('two')]), 2);
});

test('status changes and reassignment replace the persisted contribution', () => {
  const tasks = [task('one'), task('two')];
  for (const status of ['done', 'canceled_on_hold'] as const) {
    assert.equal(getProjectedActiveTaskCount(tasks, 'amir', task('one', status)), 1);
    assert.equal(getProjectedActiveTaskCount([task('one', status)], 'amir', task('one')), 1);
    assert.equal(getProjectedActiveTaskCount([], 'amir', task('new', status)), 0);
  }
  const reassigned = task('one', 'todo', 'aditya');
  assert.equal(getProjectedActiveTaskCount(tasks, 'amir', reassigned), 1);
  assert.equal(getProjectedActiveTaskCount(tasks, 'aditya', reassigned), 1);
  assert.equal(count([reassigned, tasks[1]]), 1);
});

test('legacy assignments and multiple assignees match actual workload semantics', () => {
  for (const assigneeIds of [undefined, [], ['amir', 'aditya']]) {
    const legacy = {...task('one'), assigneeIds};
    assert.equal(count([legacy]), 1);
    assert.equal(getProjectedActiveTaskCount([legacy], 'amir', legacy), 1);
  }
  assert.equal(count([{...task('one'), assigneeIds: ['aditya']}]), 0);
});

test('PM-assigned and self-created staff tasks contribute equally; overload persists on edit', () => {
  const tasks = Array.from({length: 4}, (_, i) => ({...task(String(i), 'todo', 'aditya'), assignedBy: 'pm'}));
  const own = {...task('self', 'review', 'aditya'), assignedBy: 'aditya'};
  assert.equal(count(tasks, 'aditya'), 4);
  assert.equal(getProjectedActiveTaskCount(tasks, 'aditya', own), 5);
  const saved = [...tasks, own];
  assert.equal(count(saved, 'aditya'), 5);
  assert.equal(getProjectedActiveTaskCount(saved, 'aditya', own), 5);
  assert.equal(getWorkloadInfo(count(saved, 'aditya'), 4).isOverloaded, true);
  assert.equal(getProjectedActiveTaskCount(saved, 'aditya', {...own, status: 'done'}), 4);
});
